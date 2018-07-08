import * as got from 'got';
import { ITrade, ITradeWithUSDRate } from '../../types';

interface ICryptoCompareResponse {
    USD: number;
}

function cryptocompareResponse(response: got.Response<any>) {
    if ('body' in response) {
        try {
            const result: ICryptoCompareResponse = JSON.parse(response.body);
            if (result.USD !== 0) {
                return result.USD;
            } else {
                return false;
            }
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}

function isCurrencyTrade(trade: ITrade, currency: string): boolean {
    if (trade.boughtCurrency === currency || trade.soldCurrency === currency) {
        return true;
    } else {
        return false;
    }
}

function getUSDTradeRate(trade: ITrade) {
    if (trade.boughtCurrency === 'USD') {
        return trade.amountSold / trade.rate / trade.amountSold;
    } else if (trade.soldCurrency === 'USD') {
        return trade.rate;
    } else {
        throw new Error('Not USD Trade');
    }
}

async function getBTCUSDRate(date: Date) {
    const data: string[] = [
        `fsym=BTC`,
        'tsym=USD',
        'sign=false', // change to true for security?
        `toTs=${date.getTime() / 1000}`,
        'extraParams=tApp',
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'),
    );
    return cryptocompareResponse(response);
}

export function BTCBasedRate(trade: ITrade, BTCUSDRate: number) {
    if (trade.boughtCurrency === 'BTC' || trade.boughtCurrency === 'XBT') {
        return BTCUSDRate * (trade.amountSold / trade.rate) / trade.amountSold;
    } else if (trade.soldCurrency === 'BTC' || trade.soldCurrency === 'XBT') {
        return BTCUSDRate;
    } else {
        throw new Error('Not a BTC Trade' + trade.id);
    }
}

function roundHour(date: Date) {
    date.setUTCHours(date.getUTCHours() + Math.round(date.getUTCMinutes() / 60));
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    return date.getTime();
}

interface IHourlyPriceData {
    time: number;
    high: number;
    low: number;
    open: number;
    volumeFrom: number;
    volumeto: number;
    close: number;
}

function calculateAvgerageHourPrice(data: IHourlyPriceData) {
    return (data.open + data.close + data.high + data.low) / 4;
}

async function getClosestHourPrices(trade: ITrade): Promise<number[]> {
    const data = [
        `fsym=${trade.soldCurrency}`,
        `tsym=USD`,
        `limit=2`,
        `toTs=${roundHour(new Date(trade.date)) / 1000}`,
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/histohour?' + data.join('&'),
    );
    if ('body' in response) {
        try {
            const result: any = JSON.parse(response.body);
            if ('Data' in result) {
                return [calculateAvgerageHourPrice(result.Data[0]), calculateAvgerageHourPrice(result.Data[1])];
            }
            throw new Error('Unknown Response Type');
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}

export async function getUSDRate(trade: ITrade): Promise<number> {
    const hourlyPrices = await getClosestHourPrices(trade);
    if (isCurrencyTrade(trade, 'USD')) {
        return getUSDTradeRate(trade);
    }
    if (isCurrencyTrade(trade, 'BTC') || isCurrencyTrade(trade, 'XBT')) {
        // get BTC rate and convert back
        const BTCUSDRate = await getBTCUSDRate(new Date(trade.date));
        if (BTCUSDRate) {
            hourlyPrices.push(BTCBasedRate(trade, BTCUSDRate));
            return hourlyPrices.reduce((total, currentRate) => total + currentRate) / hourlyPrices.length;
        }
    }
    // fallback to get whatever we can
    const data: string[] = [
        `fsym=${trade.soldCurrency}`,
        'tsym=USD',
        'sign=false', // change to true for security?
        `toTs=${new Date(trade.date).getTime() / 1000}`,
        'extraParams=tApp',
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'),
    );
    const rate = cryptocompareResponse(response);
    if (rate) {
        hourlyPrices.push(rate);
        return hourlyPrices.reduce((total, currentRate) => total + currentRate) / hourlyPrices.length;
    } else {
        data[0] = `fsym=${trade.boughtCurrency}`;
        const backupResponse = await got('https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'));
        const backupRate = cryptocompareResponse(backupResponse);
        if (backupRate) {
            hourlyPrices.push(backupRate / trade.rate);
            return hourlyPrices.reduce((total, currentRate) => total + currentRate) / hourlyPrices.length;
        } else {
            throw new Error('Cant get any USD Rate for trade ' + trade.id);
        }
    }
}

export async function addUSDRateToTrade(trade: ITrade): Promise<ITradeWithUSDRate> {
    const USDRate = await getUSDRate(trade);
    return {
        ...trade,
        USDRate,
    };
}

export async function addUSDRateToTrades(trades: ITrade[]): Promise<ITradeWithUSDRate[]> {
    const newTrades: ITradeWithUSDRate[]  = [];
    for (const trade of trades) {
        // cant get some rates without await maybe cryptocompare rate limiting
        newTrades.push(await addUSDRateToTrade(trade));
    }
    return Promise.all(newTrades);
}

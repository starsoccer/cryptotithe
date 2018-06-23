import * as got from 'got';
import { ITrade, ITradeWithUSDRate } from '../../types';

interface ICryptoCompareResponse {
    USD: number;
}

export async function getUSDRate(date: Date): Promise<number> {
    const data: string[] = [
        `fsym=BTC`,
        'tsym=USD',
        'sign=false', // change to true for security?
        `toTs=${date.getTime() / 1000}`,
        'extraParams=tApp',
    ];
    const response: got.Response<any> = await got('https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'));
    if ('body' in response) {
        try {
            const result: ICryptoCompareResponse = JSON.parse(response.body);
            return result.USD;
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}

export async function addUSDRateToTrade(trade: ITrade): Promise<ITradeWithUSDRate> {
    const USDRate = await getUSDRate(new Date(trade.date));
    return {
        ...trade,
        USDRate,
    };
}

export async function addUSDRateToTrades(trades: ITrade[]): Promise<ITradeWithUSDRate[]> {
    const newTrades: Array<Promise<ITradeWithUSDRate>>  = [];
    for (const trade of trades) {
        newTrades.push(addUSDRateToTrade(trade));
    }
    return Promise.all(newTrades);
}

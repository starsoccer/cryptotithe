import * as got from 'got';
import { ITrade, FiatRateMethod } from '../../../types';
import { roundHour, calculateAvgerageHourPrice, IHourlyPriceData } from '../utils'; 

export function BTCBasedRate(trade: ITrade, BTCUSDRate: number) {
    if (trade.boughtCurrency === 'BTC' || trade.boughtCurrency === 'XBT') {
        return BTCUSDRate * (trade.amountSold / trade.rate) / trade.amountSold;
    } else if (trade.soldCurrency === 'BTC' || trade.soldCurrency === 'XBT') {
        return BTCUSDRate;
    } else {
        throw new Error('Not a BTC Trade' + trade.id);
    }
}

export async function getBTCFiatRate(trade: ITrade, fiatCurrency: string, method: FiatRateMethod) {
    const tradeTime = parseInt((roundHour(new Date(trade.date)) / 1000).toFixed(0), 10);
    const data: string[] = [
        `fsym=BTC`,
        `tsym=${fiatCurrency}`,
        'sign=false', // change to true for security?
        `toTs=${tradeTime}`,
        'extraParams=tApp',
        `limit=1`,
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/histohour?' + data.join('&'),
    );
    if ('body' in response) {
        try {
            const result: any = JSON.parse(response.body);
            if ('Data' in result) {
                for (const hourData of result.Data as IHourlyPriceData[]) {
                    if (hourData.time <= tradeTime && tradeTime >= hourData.time + 3600) {
                        switch (method) {
                            case FiatRateMethod.HOURLOW:
                                return BTCBasedRate(trade, hourData.low);
                            case FiatRateMethod.HOURHIGH:
                                return BTCBasedRate(trade, hourData.high);
                            default:
                                return BTCBasedRate(trade, calculateAvgerageHourPrice(hourData));
                        }
                    }
                }
                throw new Error('Could not get Rate');
            } else {
                throw new Error('Unknown Response Type');
            }
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}

import * as got from 'got';
import { ITrade } from '../../../types';
import { cryptocompareRateResponse } from '../utils';

export function BTCBasedRate(trade: ITrade, BTCUSDRate: number) {
    if (trade.boughtCurrency === 'BTC' || trade.boughtCurrency === 'XBT') {
        return BTCUSDRate * (trade.amountSold / trade.rate) / trade.amountSold;
    } else if (trade.soldCurrency === 'BTC' || trade.soldCurrency === 'XBT') {
        return BTCUSDRate;
    } else {
        throw new Error('Not a BTC Trade' + trade.id);
    }
}

export async function getBTCFiatRate(trade: ITrade, fiatCurrency: string) {
    const data: string[] = [
        `fsym=BTC`,
        `tsym=${fiatCurrency}`,
        'sign=false', // change to true for security?
        `toTs=${new Date(trade.date).getTime() / 1000}`,
        'extraParams=tApp',
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'),
    );
    const rate = cryptocompareRateResponse(response);
    if (rate) {
        return BTCBasedRate(trade, rate);
    }
    throw new Error('Unable to get BTC Rate for trade ' + trade.id);
}

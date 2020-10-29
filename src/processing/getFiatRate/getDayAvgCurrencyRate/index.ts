import got from 'got';
import { ITrade } from '../../../types';
import { cryptocompareRateResponse } from '../utils';

export async function getDayAvg(
    fiatCurrency: string,
    currency: string,
    date: number,
    type: string = 'HourVWAP',
): Promise<number> {
    const tradeTime = parseInt((new Date(date).getTime() / 1000).toFixed(0), 10);
    const data: string[] = [
        `fsym=${currency}`,
        `tsym=${fiatCurrency}`,
        'sign=false', // change to true for security?
        `toTs=${tradeTime}`,
        'extraParams=cryptotithe',
        `avgType=${type}`,
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'),
    );
    const rate = cryptocompareRateResponse(response, fiatCurrency);
    return rate || 0;
}

export async function getDayAvgTradeRate(
    trade: ITrade,
    fiatCurrency: string,
    type: string = 'HourVWAP',
): Promise<number> {
    const rate = getDayAvg(fiatCurrency, trade.soldCurrency, trade.date);
    if (rate) {
        return rate;
    } else {
        const backupRate = getDayAvg(fiatCurrency, trade.boughtCurrency, trade.date, type);
        if (backupRate) {
            return backupRate;
        } else {
            throw new Error('Cant get any fiat Rate for trade ' + trade.ID);
        }
    }
}

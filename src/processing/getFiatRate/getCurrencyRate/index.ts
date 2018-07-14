import * as got from 'got';
import { ITrade } from '../../../types';
import { cryptocompareRateResponse } from '../utils';

export async function getCurrencyRate(trade: ITrade, fiatCurrency: string): Promise<number> {
    const data: string[] = [
        `fsym=${trade.soldCurrency}`,
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
        return rate;
    } else {
        data[0] = `fsym=${trade.boughtCurrency}`;
        const backupResponse = await got('https://min-api.cryptocompare.com/data/dayAvg?' + data.join('&'));
        const backupRate = cryptocompareRateResponse(backupResponse);
        if (backupRate) {
            return backupRate;
        } else {
            throw new Error('Cant get any USD Rate for trade ' + trade.id);
        }
    }
}

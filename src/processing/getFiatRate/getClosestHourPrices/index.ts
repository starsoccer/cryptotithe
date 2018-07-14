import * as got from 'got';
import { ITrade } from '../../../types';
import { calculateAvgerageHourPrice, roundHour } from '../utils';

export async function getClosestHourPrices(trade: ITrade, limit: number, fiatCurrency: string): Promise<number[]> {
    const data = [
        `fsym=${trade.soldCurrency}`,
        `tsym=${fiatCurrency}`,
        `limit=${limit}`,
        `toTs=${roundHour(new Date(trade.date)) / 1000}`,
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/histohour?' + data.join('&'),
    );
    if ('body' in response) {
        try {
            const result: any = JSON.parse(response.body);
            if ('Data' in result) {
                const avgs: number[] = [];
                for (const hourData of result.Data) {
                    avgs.push(calculateAvgerageHourPrice(hourData));
                }
                return avgs;
            }
            throw new Error('Unknown Response Type');
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}
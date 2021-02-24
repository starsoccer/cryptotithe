import axios from 'axios';
import { ITrade } from '../../../types';
import { cryptocompareRateResponse } from '../utils';

export async function getDayAvg(
    fiatCurrency: string,
    currency: string,
    date: number,
    type = 'HourVWAP',
): Promise<number> {
    const tradeTime = parseInt((new Date(date).getTime() / 1000).toFixed(0), 10);
    const response = await axios('https://min-api.cryptocompare.com/data/dayAvg', {
        params: {
            fsym: currency,
            tsym: fiatCurrency,
            sign: false,
            toTs: tradeTime,
            extraParams: 'cryptotithe',
            avgType: type,
        }
    });
    const rate = cryptocompareRateResponse(response, fiatCurrency);
    return rate || 0;
}

export async function getDayAvgTradeRate(
    trade: ITrade,
    fiatCurrency: string,
    type = 'HourVWAP',
): Promise<number> {
    const rate = getDayAvg(fiatCurrency, trade.soldCurrency, trade.date, type);
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

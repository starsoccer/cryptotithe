import { FiatRateMethod, ITrade } from '../../../types';
import { getClosestHourPrice } from '../getClosestHourPrice';
import { getDayAvg } from '../getDayAvgCurrencyRate';
import { calculateAverageFromArray, calculateAvgerageHourPrice } from '../utils';

export function BTCBasedRate(trade: ITrade, BTCFiatRate: number) {
    if (trade.boughtCurrency === 'BTC' || trade.boughtCurrency === 'XBT') {
        return BTCFiatRate * (trade.amountSold / trade.rate) / trade.amountSold;
    } else if (trade.soldCurrency === 'BTC' || trade.soldCurrency === 'XBT') {
        return BTCFiatRate;
    } else {
        throw new Error('Not a BTC Trade' + trade.ID);
    }
}

export async function getBTCFiatRate(trade: ITrade, fiatCurrency: string, method: FiatRateMethod) {
    switch (method) {
        case FiatRateMethod['Double Average']:
            const dayAvg = await getDayAvg(fiatCurrency, 'BTC', trade.date);
            const hourBTCData = await getClosestHourPrice('BTC', fiatCurrency, trade.date);
            return BTCBasedRate(trade, calculateAverageFromArray([dayAvg, calculateAvgerageHourPrice(hourBTCData)]));
        case FiatRateMethod['Day Average']:
            const vwapRate = await getDayAvg(fiatCurrency, 'BTC', trade.date);
            return BTCBasedRate(trade, vwapRate);
        case FiatRateMethod['Day Average Middle']:
            const midRate = await getDayAvg(fiatCurrency, 'BTC', trade.date, 'MidHighLow');
            return BTCBasedRate(trade, midRate);
        case FiatRateMethod['Day Average Volume']:
            const volumeRate = await getDayAvg(fiatCurrency, 'BTC', trade.date, 'VolFVolT');
            return BTCBasedRate(trade, volumeRate);
        default:
            const hourData = await getClosestHourPrice('BTC', fiatCurrency, trade.date);
            switch (method) {
                case FiatRateMethod['Hour Low']:
                    return BTCBasedRate(trade, hourData.low);
                case FiatRateMethod['Hour High']:
                    return BTCBasedRate(trade, hourData.high);
                case FiatRateMethod['Hour Open']:
                    return BTCBasedRate(trade, hourData.open);
                case FiatRateMethod['Hour Close']:
                    return BTCBasedRate(trade, hourData.close);
                default:
                    return BTCBasedRate(trade, calculateAvgerageHourPrice(hourData));
            }
    }
}

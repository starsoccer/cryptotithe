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
        case FiatRateMethod.DOUBLEAVERAGE:
            const dayAvg = await getDayAvg(fiatCurrency, 'BTC', trade.date);
            const hourBTCData = await getClosestHourPrice('BTC', fiatCurrency, trade.date);
            return calculateAverageFromArray([dayAvg, calculateAvgerageHourPrice(hourBTCData)]);
        case FiatRateMethod.DAYAVERAGE:
            const vwapRate = await getDayAvg(fiatCurrency, 'BTC', trade.date);
            return BTCBasedRate(trade, vwapRate);
        case FiatRateMethod.DAYAVERAGEMID:
            const midRate = await getDayAvg(fiatCurrency, 'BTC', trade.date, 'MidHighLow');
            return BTCBasedRate(trade, midRate);
        case FiatRateMethod.DAYAVERAGEVOLUME:
            const volumeRate = await getDayAvg(fiatCurrency, 'BTC', trade.date, 'VolFVolT');
            return BTCBasedRate(trade, volumeRate);
        default:
            const hourData = await getClosestHourPrice('BTC', fiatCurrency, trade.date);
            switch (method) {
                case FiatRateMethod.HOURLOW:
                    return BTCBasedRate(trade, hourData.low);
                case FiatRateMethod.HOURHIGH:
                    return BTCBasedRate(trade, hourData.high);
                case FiatRateMethod.HOUROPEN:
                    return BTCBasedRate(trade, hourData.open);
                case FiatRateMethod.HOURCLOSE:
                    return BTCBasedRate(trade, hourData.close);
                default:
                    return BTCBasedRate(trade, calculateAvgerageHourPrice(hourData));
            }
    }
}

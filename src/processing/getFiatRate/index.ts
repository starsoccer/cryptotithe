import { FiatRateMethod, ITrade, ITradeWithFiatRate } from '../../types';
import { getBTCFiatRate } from './BTCBasedRate';
import { getClosestHourPriceForTrade } from './getClosestHourPrice';
import { getDayAvgTradeRate } from './getDayAvgCurrencyRate';
import { calculateAverageFromArray, calculateAvgerageHourPrice, isCurrencyTrade } from './utils';

export async function getFiatRate(
    trade: ITrade,
    fiatCurrency: string,
    method: FiatRateMethod,
): Promise<ITradeWithFiatRate> {
    if (isCurrencyTrade(trade, fiatCurrency)) {
        return addRatetoTrade(trade, getFiatTradeRate(trade, fiatCurrency));
    } else {
        // non fiat currency trade
        if (isCurrencyTrade(trade, 'BTC')) {
            const BTCBasedRate = await getBTCFiatRate(trade, fiatCurrency, method);
            return addRatetoTrade(trade, BTCBasedRate);
        } else {
            switch (method) {
                case FiatRateMethod['Double Average']:
                    const dayAvgDouble = await getDayAvgTradeRate(trade, fiatCurrency);
                    const closestHourAvg = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(
                        trade,
                        calculateAverageFromArray([
                            dayAvgDouble,
                            calculateAvgerageHourPrice(closestHourAvg),
                        ]),
                    );
                case FiatRateMethod['Day Average']:
                    const dayAvg = await getDayAvgTradeRate(trade, fiatCurrency);
                    return addRatetoTrade(trade, dayAvg);
                case FiatRateMethod['Day Average Middle']:
                    const dayAvgMid = await getDayAvgTradeRate(trade, fiatCurrency, 'MidHighLow');
                    return addRatetoTrade(trade, dayAvgMid);
                case FiatRateMethod['Day Average Volume']:
                    const dayAvgVolume = await getDayAvgTradeRate(trade, fiatCurrency, 'VolFVolT');
                    return addRatetoTrade(trade, dayAvgVolume);
                case FiatRateMethod['Hour Low']:
                    const lowPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, lowPrice.low);
                case FiatRateMethod['Hour High']:
                    const highPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, highPrice.high);
                case FiatRateMethod['Hour Open']:
                    const openPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, openPrice.open);
                case FiatRateMethod['Hour Close']:
                    const closePrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, closePrice.close);
                default:
                    const avg = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, calculateAvgerageHourPrice(avg));
            }
        }
    }
}

function addRatetoTrade(trade: ITrade, rate: number): ITradeWithFiatRate {
    return {
        ...trade,
        fiatRate: rate,
    };
}

export async function addFiatRateToTrades(
    trades: ITrade[],
    fiatCurrency: string,
    method: FiatRateMethod = FiatRateMethod['Double Average'],
): Promise<ITradeWithFiatRate[]> {
    const newTrades: ITradeWithFiatRate[]  = [];
    for (const trade of trades) {
        // cant get some rates without await maybe cryptocompare rate limiting
        newTrades.push(await getFiatRate(trade, fiatCurrency, method));
    }
    return Promise.all(newTrades);
}

function getFiatTradeRate(trade: ITrade, fiatCurrency: string) {
    if (trade.boughtCurrency === fiatCurrency) {
        return trade.amountSold / trade.rate / trade.amountSold;
    } else if (trade.soldCurrency === fiatCurrency) {
        return trade.rate;
    } else {
        throw new Error(`Not ${fiatCurrency} Trade`);
    }
}

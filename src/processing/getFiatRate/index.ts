import { FiatRateMethod, ITrade, ITradeWithUSDRate } from '../../types';
import { getBTCFiatRate } from './BTCBasedRate';
import { getClosestHourPriceForTrade } from './getClosestHourPrice';
import { getDayAvgTradeRate } from './getDayAvgCurrencyRate';
import { calculateAverageFromArray, calculateAvgerageHourPrice, isCurrencyTrade } from './utils';

export async function getFiatRate(
    trade: ITrade,
    fiatCurrency: string,
    method: FiatRateMethod,
): Promise<ITradeWithUSDRate> {
    if (isCurrencyTrade(trade, fiatCurrency)) {
        return addRatetoTrade(trade, getUSDTradeRate(trade, fiatCurrency));
    } else {
        // non fiat currency trade
        if (isCurrencyTrade(trade, 'BTC')) {
            const BTCBasedRate = await getBTCFiatRate(trade, fiatCurrency, method);
            return addRatetoTrade(trade, BTCBasedRate);
        } else {
            switch (method) {
                case FiatRateMethod.DOUBLEAVERAGE:
                    const dayAvgDouble = await getDayAvgTradeRate(trade, fiatCurrency);
                    const closestHourAvg = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(
                        trade,
                        calculateAverageFromArray([
                            dayAvgDouble,
                            calculateAvgerageHourPrice(closestHourAvg),
                        ]),
                    );
                case FiatRateMethod.DAYAVERAGE:
                    const dayAvg = await getDayAvgTradeRate(trade, fiatCurrency);
                    return addRatetoTrade(trade, dayAvg);
                case FiatRateMethod.DAYAVERAGEMID:
                    const dayAvgMid = await getDayAvgTradeRate(trade, fiatCurrency, 'MidHighLow');
                    return addRatetoTrade(trade, dayAvgMid);
                case FiatRateMethod.DAYAVERAGEVOLUME:
                    const dayAvgVolume = await getDayAvgTradeRate(trade, fiatCurrency, 'VolFVolT');
                    return addRatetoTrade(trade, dayAvgVolume);
                case FiatRateMethod.HOURLOW:
                    const lowPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, lowPrice.low);
                case FiatRateMethod.HOURHIGH:
                    const highPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, highPrice.high);
                case FiatRateMethod.HOUROPEN:
                    const openPrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, openPrice.open);
                case FiatRateMethod.HOURCLOSE:
                    const closePrice = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, closePrice.close);
                default:
                    const avg = await getClosestHourPriceForTrade(trade, fiatCurrency);
                    return addRatetoTrade(trade, calculateAvgerageHourPrice(avg));
            }
        }
    }
}

function addRatetoTrade(trade: ITrade, rate: number): ITradeWithUSDRate {
    return {
        ...trade,
        USDRate: rate,
    };
}

export async function addFiatRateToTrades(
    trades: ITrade[],
    fiatCurrency: string,
    method: FiatRateMethod = FiatRateMethod.DOUBLEAVERAGE,
): Promise<ITradeWithUSDRate[]> {
    const newTrades: ITradeWithUSDRate[]  = [];
    for (const trade of trades) {
        // cant get some rates without await maybe cryptocompare rate limiting
        newTrades.push(await getFiatRate(trade, fiatCurrency, method));
    }
    return Promise.all(newTrades);
}

function getUSDTradeRate(trade: ITrade, fiatCurrency: string) {
    if (trade.boughtCurrency === fiatCurrency) {
        return trade.amountSold / trade.rate / trade.amountSold;
    } else if (trade.soldCurrency === fiatCurrency) {
        return trade.rate;
    } else {
        throw new Error(`Not ${fiatCurrency} Trade`);
    }
}

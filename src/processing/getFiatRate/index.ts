import { FiatRateMethod, ITrade, ITradeWithUSDRate } from '../../types';
import { getClosestHourPrices } from './getClosestHourPrices';
import { isCurrencyTrade } from './utils';
import { getBTCFiatRate } from './BTCBasedRate';

export async function getFiatRate(trade: ITrade, fiatCurrency: string, method: FiatRateMethod): Promise<ITradeWithUSDRate> {
    if (isCurrencyTrade(trade, fiatCurrency)) {
        return addRatetoTrade(trade, getUSDTradeRate(trade, fiatCurrency));
    } else {
        // non fiat currency trade
        switch (method) {
            case FiatRateMethod.DOUBLEAVERAGE:
            default:
                const closestHoursAvg = await getClosestHourPrices(trade, 1, fiatCurrency);
                const BTCDayAvg = await getBTCFiatRate(trade, fiatCurrency);
                return addRatetoTrade(trade, (closestHoursAvg[0] + BTCDayAvg) / 2);
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

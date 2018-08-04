import { IDailyBalance, IHoldings, ITradeWithFiatRate } from '../../types';
import { calculateGains } from '../CalculateGains';
import { calculateHoldingsValue } from '../CalculateHoldingsValue';
import SortTrades from '../SortTrades';

export async function calculateDailyBalance(
    trades: ITradeWithFiatRate[],
    fiatCurrency: string,
): Promise<IDailyBalance[]> {
    const dailyBalance: IDailyBalance[] = [];
    let holdings: IHoldings = {};
    const sortedTrades = SortTrades(trades) as ITradeWithFiatRate[];
    const endingDate = sortedTrades[sortedTrades.length - 1].date;
    for (let index = sortedTrades[0].date; index < endingDate; index += 86400000) {
        const tradesOfDay = sortedTrades.filter((trade) => trade.date <= index + 86400000 && trade.date >= index);
        holdings = calculateGains(holdings, tradesOfDay, fiatCurrency).newHoldings;
        const result = await calculateHoldingsValue(holdings, fiatCurrency, new Date(index));
        dailyBalance.push({
            date: new Date(index),
            holdings: result.currencies,
            fiatValue: result.total,
        });
    }
    return dailyBalance;
}

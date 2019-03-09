import { IDailyBalance, IHoldings, ISavedData, ITradeWithFiatRate, ITransaction, Location } from '../../types';
import { calculateGains } from '../CalculateGains';
import { calculateHoldingsValue } from '../CalculateHoldingsValue';
import filterCurrencyHoldingsByLocation from '../filterCurrencyHoldingsByLocation';
import processTransactions from '../ProcessTransactions';
import SortTrades from '../SortTrades';

export async function calculateDailyBalance(
    savedData: ISavedData,
    year: number,
    location: Location,
    updateProgress: (totalDays: number, daysLeft: number) => void,
): Promise<IDailyBalance[]> {
    const dailyBalance: IDailyBalance[] = [];
    let holdings: IHoldings = {};
    const startingDate = new Date(`1-1-${year}`).getTime();
    const endingDate = new Date(`1-1-${year + 1}`).getTime();
    const filteredTrades = savedData.trades.filter((trade) =>
        trade.exchange === location &&
        new Date(trade.date).getFullYear() === year,
    );
    const sortedTrades = SortTrades(filteredTrades) as ITradeWithFiatRate[];
    const totalDays = Math.abs((startingDate - endingDate) / 86400000);

    const firstTrade = savedData.trades.find((trade) => trade.exchange === location);
    if (firstTrade !== undefined && new Date(firstTrade.date).getFullYear() !== year) {
        const priorTrades = savedData.trades.filter((trade) =>
            trade.exchange === location &&
            new Date(trade.date).getFullYear() < year,
        );
        holdings = calculateGains(holdings, priorTrades, savedData.settings.fiatCurrency).newHoldings;

        const priorTransactions = savedData.transactions.filter((transaction) =>
            transaction.date < startingDate && transaction.from === location,
        );

        holdings = processTransactions(priorTransactions, holdings);
        holdings = filterCurrencyHoldingsByLocation(location, holdings);
    }

    for (let index = startingDate; index < endingDate; index += 86400000) {
        updateProgress(totalDays, Math.abs((index - endingDate) / 86400000));
        const tradesOfDay = sortedTrades.filter((trade) => trade.date <= index + 86400000 && trade.date >= index);
        holdings = calculateGains(holdings, tradesOfDay, savedData.settings.fiatCurrency).newHoldings;

        const dayTransactions = getDayTransactions(new Date(index), savedData.transactions);
        holdings = processTransactions(dayTransactions, holdings);
        holdings = filterCurrencyHoldingsByLocation(location, holdings);

        const result = await calculateHoldingsValue(holdings, savedData.settings.fiatCurrency, new Date(index));
        dailyBalance.push({
            date: new Date(index),
            holdings: result.currencies,
            fiatValue: result.total,
        });
    }
    return dailyBalance;
}

function getDayTransactions(date: Date, transactions: ITransaction[]) {
    const dayInMilliseconds = 86400000;
    return transactions.filter((transaction) =>
        date.getTime() - dayInMilliseconds / 2 <= transaction.date &&
        date.getTime() + dayInMilliseconds / 2 >= transaction.date,
    );
}

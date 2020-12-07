import { calculateGains } from '../processing/CalculateGains';
import SortTrades from '../processing/SortTrades';
import SortTransactions from '../processing/SortTransactions';
import SortIncomes from '../processing/SortIncome';
import { IIncomeWithFiatRate, IPartialSavedData, ISavedData, ISettings, ITradeWithFiatRate } from '../types';
import integrityCheck from '../utils/integrityCheck';

export default function save(data: IPartialSavedData, fallback: ISavedData): ISavedData {
    // eslint-disable-next-line
    const packageData = require('../../package.json');
    const newTrades = data.trades || fallback.trades || [];
    const newTransactions = data.transactions || fallback.transactions || [];
    const newIncomes = data.incomes || fallback.incomes || [];
    const newSettings = (data.settings || fallback.settings) as ISettings;

    const sortedTrades = SortTrades(newTrades) as ITradeWithFiatRate[];
    const sortedTransactions = SortTransactions(newTransactions);
    const sortedIncomes = SortIncomes(newIncomes) as IIncomeWithFiatRate[];

    const currentHoldings = calculateGains(
        {},
        sortedTrades,
        sortedIncomes,
        newSettings.fiatCurrency,
        newSettings.gainCalculationMethod,
    ).newHoldings;

    const savedData: IPartialSavedData = {
        savedDate: new Date(),
        trades: sortedTrades,
        transactions: sortedTransactions,
        incomes: sortedIncomes,
        holdings: currentHoldings,
        settings: newSettings,
        version: packageData.version,
    };

    savedData.integrity = integrityCheck(savedData as ISavedData);

    return savedData as ISavedData;
}

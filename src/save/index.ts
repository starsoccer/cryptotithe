import { calculateGains } from '../processing/CalculateGains';
import SortTrades from '../processing/SortTrades';
import { IPartialSavedData, ISavedData, ITradeWithFiatRate } from '../types';

export default function save(data: IPartialSavedData, fallback: ISavedData): ISavedData {
    const packageData = require('../../package.json');
    const newTrades = data.trades || fallback.trades;
    const newSettings = data.settings || fallback.settings;

    const sortedTrades = SortTrades(newTrades) as ITradeWithFiatRate[];
    const currentHoldings = calculateGains(
        {},
        sortedTrades,
        newSettings.fiatCurrency,
        newSettings.gainCalculationMethod,
    ).newHoldings;

    const savedData: ISavedData = {
        savedDate: new Date(),
        trades: sortedTrades,
        holdings: currentHoldings,
        settings: newSettings,
        version: packageData.version,
    };
    return savedData;
}

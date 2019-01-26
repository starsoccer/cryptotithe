import { calculateGains } from '../processing/CalculateGains';
import SortTrades from '../processing/SortTrades';
import { IPartialSavedData, ISavedData, ISettings, ITradeWithFiatRate } from '../types';
import integrityCheck from '../utils/integrityCheck';

export default function save(data: IPartialSavedData, fallback: ISavedData): ISavedData {
    const packageData = require('../../package.json');
    const newTrades = data.trades || fallback.trades;
    const newSettings = (data.settings || fallback.settings) as ISettings;

    const sortedTrades = SortTrades(newTrades) as ITradeWithFiatRate[];
    const currentHoldings = calculateGains(
        {},
        sortedTrades,
        newSettings.fiatCurrency,
        newSettings.gainCalculationMethod,
    ).newHoldings;

    const savedData: IPartialSavedData = {
        savedDate: new Date(),
        trades: sortedTrades,
        holdings: currentHoldings,
        settings: newSettings,
        version: packageData.version,
    };

    savedData.integrity = integrityCheck(savedData as ISavedData);

    return savedData as ISavedData;
}

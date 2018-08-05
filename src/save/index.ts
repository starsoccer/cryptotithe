import { IPartialSavedData, ISavedData, ITradeWithFiatRate } from '../types';
import SortTrades from '../processing/SortTrades';

export default function save(data: IPartialSavedData, fallback: ISavedData): ISavedData {
    const packageData = require('../../package.json');
    const newHoldings = data.holdings || fallback.holdings;
    const newTrades = data.trades || fallback.trades;
    const newSettings = data.settings || fallback.settings;
    const savedData: ISavedData = {
        savedDate: new Date(),
        trades: SortTrades(newTrades) as ITradeWithFiatRate[],
        holdings: newHoldings,
        settings: newSettings,
        version: packageData.version,
    };
    return savedData;
}
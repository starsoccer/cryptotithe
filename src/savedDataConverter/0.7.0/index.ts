import { calculateGains } from '../../processing/CalculateGains';
import { ISavedData } from '../../types';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;

    if (0 in savedData.trades) {
        changeMade = true;
        savedData.holdings = calculateGains(
            {},
            savedData.trades,
            savedData.settings.fiatCurrency,
            savedData.settings.gainCalculationMethod,
        ).newHoldings;
    }

    return changeMade;
}

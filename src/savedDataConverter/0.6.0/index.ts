import { EXCHANGES, FiatRateMethod, ISavedData } from '../../types';
import integrityCheck from '../../utils/integrityCheck';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;

    if (0 in savedData.trades) {
        if (
            'exchange' in savedData.trades[0]
        ) {
            const validExchangeKeys = Object.keys(EXCHANGES);
            for (const trade of savedData.trades) {
                if (validExchangeKeys.indexOf(trade.exchange) !== -1) {
                    changeMade = true;
                    trade.exchange = EXCHANGES[trade.exchange];
                }
            }
        }
    }

    if ('settings' in savedData) {
        if (savedData.settings.fiatRateMethod) {
            const validFiatRateMethodKeys = Object.keys(FiatRateMethod);
            if (validFiatRateMethodKeys.indexOf(savedData.settings.fiatRateMethod) !== -1) {
                changeMade = true;
                savedData.settings.fiatRateMethod = FiatRateMethod[savedData.settings.fiatRateMethod];
            }
        }
    }

    if ('integrity' in savedData === false) {
        changeMade = true;
        savedData.integrity = integrityCheck(savedData);
    }

    return changeMade;
}

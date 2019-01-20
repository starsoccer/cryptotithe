import { FiatRateMethod, IPartialSavedData } from '../../types';

export default function converter(savedData: IPartialSavedData): boolean {
    let changeMade = false;
    if (savedData.trades !== undefined && savedData.trades.length && 'USDRate' in savedData.trades[0]) {
        changeMade = true;
        for (const trade of savedData.trades) {
            const oldFormatTrade = trade as any;
            trade.fiatRate = oldFormatTrade.USDRate;
            delete oldFormatTrade.USDRate;
        }
    }

    if (savedData.holdings !== undefined && Object.keys(savedData.holdings).length) {
        const keys = Object.keys(savedData.holdings);
        if ('rateInUSD' in savedData.holdings[keys[0]][0]) {
            changeMade = true;
            for (const currency of keys) {
                for (const holding of savedData.holdings[currency]) {
                    const oldFormatHolding = holding as any;
                    holding.rateInFiat = oldFormatHolding.rateInUSD;
                    delete oldFormatHolding.rateInUSD;
                }
            }
        }
    }

    if ('settings' in savedData === false || savedData.settings === undefined) {
        savedData.settings = {};
    }

    if ('fiatCurrency' in savedData === false) {
        savedData.settings.fiatCurrency = 'USD';
    }

    if ('fiatRateMethod' in savedData === false) {
        savedData.settings.fiatRateMethod = Object.keys(FiatRateMethod)[0] as keyof typeof FiatRateMethod;
    }

    return changeMade;
}

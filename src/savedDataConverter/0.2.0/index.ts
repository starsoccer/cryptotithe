import { ISavedData } from '../../types';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;
    if (savedData.trades.length && 'USDRate' in savedData.trades[0]) {
        changeMade = true;
        for (const trade of savedData.trades) {
            const oldFormatTrade = trade as any;
            trade.fiatRate = oldFormatTrade.USDRate;
            delete oldFormatTrade.USDRate;
        }
    }

    if (Object.keys(savedData.holdings).length) {
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
    return changeMade;
}

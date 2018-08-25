import { ICurrencyHolding, IHoldings, ITrade, METHOD } from '../../../types';

interface IGetHolding {
    holding: ICurrencyHolding;
    startingIndex: number;
    endingIndex: number;
}

const FULL_YEAR_IN_MILLISECONDS = 31536000000;

export default function getCurrencyHolding(holdings: IHoldings, method: METHOD, trade: ITrade): IGetHolding {
    switch (method) {
        case METHOD.LTFO:
            let lowestTaxHoldingIndex = 0;
            const lowestTaxHolding = holdings[trade.soldCurrency].reduce(
                (lowestTax, currentCurrencyHolding, currentIndex) => {
                if (trade.date - currentCurrencyHolding.date >= FULL_YEAR_IN_MILLISECONDS) {
                    // long term gain
                    if (trade.date - lowestTax.date >= FULL_YEAR_IN_MILLISECONDS) {
                        if (currentCurrencyHolding.rateInFiat > lowestTax.rateInFiat) {
                            lowestTaxHoldingIndex = currentIndex;
                            return currentCurrencyHolding;
                        }
                        return lowestTax;
                    } else {
                        lowestTaxHoldingIndex = currentIndex;
                        return currentCurrencyHolding;
                    }
                } else {
                    if (trade.date - lowestTax.date >= FULL_YEAR_IN_MILLISECONDS) {
                        return lowestTax;
                    } else {
                        if (currentCurrencyHolding.rateInFiat > lowestTax.rateInFiat) {
                            lowestTaxHoldingIndex = currentIndex;
                            return currentCurrencyHolding;
                        }
                        return lowestTax;
                    }
                }
            });
            return {
                holding: lowestTaxHolding,
                startingIndex: lowestTaxHoldingIndex,
                endingIndex: 1,
            };
        case METHOD.HTFO:
            let highestTaxHoldingIndex = 0;
            const highestTaxHolding = holdings[trade.soldCurrency].reduce(
                (highestTax, currentCurrencyHolding, currentIndex) => {
                if (trade.date - currentCurrencyHolding.date >= FULL_YEAR_IN_MILLISECONDS) {
                    // long term gain
                    if (trade.date - highestTax.date >= FULL_YEAR_IN_MILLISECONDS) {
                        if (currentCurrencyHolding.rateInFiat < highestTax.rateInFiat) {
                            highestTaxHoldingIndex = currentIndex;
                            return currentCurrencyHolding;
                        }
                    }
                    return highestTax;
                } else {
                    if (trade.date - highestTax.date >= FULL_YEAR_IN_MILLISECONDS) {
                        highestTaxHoldingIndex = currentIndex;
                        return currentCurrencyHolding;
                    } else {
                        if (currentCurrencyHolding.rateInFiat < highestTax.rateInFiat) {
                            highestTaxHoldingIndex = currentIndex;
                            return currentCurrencyHolding;
                        }
                        return highestTax;
                    }
                }
            });
            return {
                holding: highestTaxHolding,
                startingIndex: highestTaxHoldingIndex,
                endingIndex: 1,
            };
        case METHOD.LCFO:
            let lowestCostHoldingIndex = 0;
            const lowestCostHolding = holdings[trade.soldCurrency].reduce(
                (lowestCost, currentCurrencyHolding, currentIndex) => {
                if (lowestCost.rateInFiat < currentCurrencyHolding.rateInFiat) {
                    return lowestCost;
                } else {
                    lowestCostHoldingIndex = currentIndex;
                    return currentCurrencyHolding;
                }
            });
            return {
                holding: lowestCostHolding,
                startingIndex: lowestCostHoldingIndex,
                endingIndex: 1,
            };
        case METHOD.HCFO:
            let highestCostHoldingIndex = 0;
            const highestCostHolding = holdings[trade.soldCurrency].reduce(
                (highestCost, currentCurrencyHolding, currentIndex) => {
                if (highestCost.rateInFiat > currentCurrencyHolding.rateInFiat) {
                    return highestCost;
                } else {
                    highestCostHoldingIndex = currentIndex;
                    return currentCurrencyHolding;
                }
            });
            return {
                holding: highestCostHolding,
                startingIndex: highestCostHoldingIndex,
                endingIndex: 1,
            };
        case METHOD.LIFO:
            return {
                holding: holdings[trade.soldCurrency][holdings[trade.soldCurrency].length - 1],
                startingIndex: -1,
                endingIndex: 1,
            };
            break;
        case METHOD.FIFO:
        default:
            return {
                holding: holdings[trade.soldCurrency][0],
                startingIndex: 0,
                endingIndex: 1,
            };
    }
}

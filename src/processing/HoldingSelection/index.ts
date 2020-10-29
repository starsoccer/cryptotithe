import clone from 'clone';
import {
    ICurrencyHolding,
    IHoldings,
    ITrade,
    METHOD,
} from '../../types';
import getCurrencyHolding from './getCurrencyHolding';

export interface IHoldingSelection {
    deductedHoldings: ICurrencyHolding[];
    newHoldings: IHoldings;
}

export default function holdingSelection(
    holdings: IHoldings,
    trade: ITrade,
    fiatCurrency: string,
    method: METHOD = METHOD.FIFO,
): IHoldingSelection {
    holdings = clone(holdings);
    const currencyHolding: ICurrencyHolding[] = [];
    let amountUsed: number = trade.amountSold;
    while (amountUsed !== 0) {
        if (trade.soldCurrency in holdings) {
            const selectedCurrencyHolding = getCurrencyHolding(holdings, method || METHOD.FIFO, trade);
            const result = checkCurrencyHoldingAmount(amountUsed, selectedCurrencyHolding.holding);
            currencyHolding.push(result.deductedCurrencyHolding);
            if (result.amountRemaining === 0) {
                selectedCurrencyHolding.holding.amount = selectedCurrencyHolding.holding.amount - amountUsed;
            } else {
                holdings[trade.soldCurrency].splice(
                    selectedCurrencyHolding.startingIndex, selectedCurrencyHolding.endingIndex,
                );
            }
            amountUsed = result.amountRemaining;

            if (!holdings[trade.soldCurrency].length) {
                delete holdings[trade.soldCurrency];
            }
        } else {
            if (trade.soldCurrency === fiatCurrency) {
                currencyHolding.push({
                    amount: amountUsed,
                    date: trade.date,
                    rateInFiat: 1,
                    location: trade.exchange,
                });
            } else {
                currencyHolding.push({
                    amount: amountUsed,
                    date: trade.date,
                    rateInFiat: 0,
                    location: trade.exchange,
                });
            }
            amountUsed = 0;
        }
    }
    return {
        deductedHoldings: currencyHolding,
        newHoldings: holdings,
    };
}

interface ICheckCurrencyHoldingAmount {
    amountRemaining: number;
    deductedCurrencyHolding: ICurrencyHolding;
}

function checkCurrencyHoldingAmount(
    amountUsed: number,
    holdingToCheck: ICurrencyHolding,
): ICheckCurrencyHoldingAmount {
    if (holdingToCheck.amount > amountUsed) {
        return {
            amountRemaining: 0,
            deductedCurrencyHolding: {
                amount: amountUsed,
                rateInFiat: holdingToCheck.rateInFiat,
                date: holdingToCheck.date,
                location: holdingToCheck.location,
            },
        };
    } else {
        return {
            amountRemaining: amountUsed - holdingToCheck.amount,
            deductedCurrencyHolding: {
                amount: holdingToCheck.amount,
                rateInFiat: holdingToCheck.rateInFiat,
                date: holdingToCheck.date,
                location: holdingToCheck.location,
            },
        };
    }
}

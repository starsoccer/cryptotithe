import { ITransaction, IHoldings, ICurrencyHolding } from '../../types';
import * as clone from 'clone';

export default function processTransactions(transactions: ITransaction[], holdings: IHoldings) {
    const newHoldings = clone(holdings);
    for (const transaction of transactions) {
        let amountUsed = transaction.amount;
        if (transaction.currency in newHoldings) {
            for (let holdingIndex = 0; holdingIndex < newHoldings[transaction.currency].length; holdingIndex++) {
                if (newHoldings[transaction.currency][holdingIndex].location === transaction.from) {
                    if (newHoldings[transaction.currency][holdingIndex].amount > amountUsed) {
                        newHoldings[transaction.currency][holdingIndex].amount -= amountUsed;
                        const newCurrencyHolding: ICurrencyHolding = {
                            amount: amountUsed,
                            rateInFiat:  newHoldings[transaction.currency][holdingIndex].rateInFiat,
                            date:  newHoldings[transaction.currency][holdingIndex].date,
                            location:  transaction.to,
                        };
                        newHoldings[transaction.currency].splice(holdingIndex, 0, newCurrencyHolding);
                        amountUsed = 0;
                        break;
                    } else {
                        amountUsed -= newHoldings[transaction.currency][holdingIndex].amount;
                        newHoldings[transaction.currency][holdingIndex].location = transaction.to;
                    }
                }
            }
        }
    }
    return newHoldings;
}

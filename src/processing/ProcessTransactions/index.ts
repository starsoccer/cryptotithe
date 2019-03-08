import { ITransaction, IHoldings, ICurrencyHolding } from '../../types';
import * as clone from 'clone';

export default function processTransactions(transactions: ITransaction[], holdings: IHoldings) {
    const newHoldings = clone(holdings);
    for (const transaction of transactions) {
        let amountUsed = transaction.amount;
        if (transaction.currency in holdings) {
            for (let holdingIndex = 0; holdingIndex < holdings[transaction.currency].length; holdingIndex++) {
                if (holdings[transaction.currency][holdingIndex].location === transaction.from) {
                    if (holdings[transaction.currency][holdingIndex].amount > amountUsed) {
                        holdings[transaction.currency][holdingIndex].amount -= amountUsed;
                        const newCurrencyHolding: ICurrencyHolding = {
                            amount: amountUsed,
                            rateInFiat:  holdings[transaction.currency][holdingIndex].rateInFiat,
                            date:  holdings[transaction.currency][holdingIndex].date,
                            location:  transaction.to,
                        };
                        holdings[transaction.currency].splice(holdingIndex, 0, newCurrencyHolding);
                        amountUsed = 0;
                        break;
                    } else {
                        amountUsed -= holdings[transaction.currency][holdingIndex].amount;
                        holdings[transaction.currency][holdingIndex].location = transaction.to;
                    }
                }
            }
        }
    }
    return newHoldings;
}

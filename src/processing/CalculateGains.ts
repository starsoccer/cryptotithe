import { ITradeWithUSDRate, IHoldings, ICurrencyHolding, METHOD } from '../types'
import * as clone from 'clone';

const FULL_YEAR_IN_MILLISECONDS = 31536000000;

export function calculateGains(holdings: IHoldings, trades: ITradeWithUSDRate[]) {
    let shortTermGain = 0;
    let longTermGain = 0;
    let newHoldings = clone(holdings);
    for(const trade of trades) {
        const result = getCurrenyHolding(newHoldings, trade.soldCurrency, trade.amountSold);
        newHoldings = result.newHoldings;
        if (trade.boughtCurreny in newHoldings === false) {
            newHoldings[trade.boughtCurreny] = [];
        }
        newHoldings[trade.boughtCurreny].push({
            amount: trade.amountSold / trade.rate,
            cost: trade.USDRate * trade.rate,
            date: new Date(),
        });
        for (const holding of result.deductedHoldings) {
            const gain = (trade.USDRate - holding.cost) * holding.amount

            if (trade.date.getTime() - holding.date.getTime() > FULL_YEAR_IN_MILLISECONDS) {
                longTermGain += gain;
            } else {
                shortTermGain += gain;
            }
        }
    }
    return {
        newHoldings: newHoldings,
        longTermGain: longTermGain,
        shortTermGain: shortTermGain,
    }
}

interface IGetCurrencyHolding {
    deductedHoldings: ICurrencyHolding[];
    newHoldings: IHoldings;
}

export function getCurrenyHolding (holdings: IHoldings, currency: string, amount: number, method: METHOD = undefined): IGetCurrencyHolding {
    holdings = clone(holdings);
    const currencyHolding = [];
    let amountUsed = amount;
    while(amountUsed !== 0) {
        if (currency in holdings) {
            switch (method) {
                case METHOD.LIFO:  
                    const lastIn = holdings[currency][holdings[currency].length - 1];
                    if (lastIn.amount > amountUsed) {
                        lastIn.amount = lastIn.amount - amountUsed;
                        currencyHolding.push({
                            amount: amountUsed,
                            cost: lastIn.cost,
                            date: lastIn.date
                        });
                        amountUsed = 0;
                    } else {
                        amountUsed = amountUsed - lastIn.amount;
                        currencyHolding.push(holdings[currency].pop());
                    }
                    break;
                case METHOD.HCFO:
                    //return '';
                case METHOD.FIFO:
                default:
                    const firstIn = holdings[currency][0];
                    if (firstIn.amount > amountUsed) {
                        firstIn.amount = firstIn.amount - amountUsed;
                        currencyHolding.push({
                            amount: amountUsed,
                            cost: firstIn.cost,
                            date: firstIn.date
                        });
                        amountUsed = 0;
                    } else {
                        amountUsed = amountUsed - firstIn.amount;
                        currencyHolding.push(holdings[currency][0]);
                        holdings[currency].splice(0, 1);
                    }
                break;     
            }
            if (!holdings[currency].length) {
                delete holdings[currency];
            }
        } else {
            currencyHolding.push({
                amount: amountUsed,
                date: new Date(),
                cost: 0,
            });
            amountUsed = 0;
        }
    }
    return {
        deductedHoldings: currencyHolding,
        newHoldings: holdings,
    };
}



import * as clone from 'clone';
import { ICurrencyHolding, IHoldings, ITradeWithGains, ITradeWithUSDRate, METHOD } from '../../types';

const FULL_YEAR_IN_MILLISECONDS: number = 31536000000;

export interface ICalculateGains {
    newHoldings: IHoldings;
    longTermGain: number;
    shortTermGain: number;
}

export function calculateGains(holdings: IHoldings, trades: ITradeWithUSDRate[]): ICalculateGains {
    let shortTermGain: number = 0;
    let longTermGain: number = 0;
    let newHoldings: IHoldings = clone(holdings);
    for (const trade of trades) {
        const result: IGetCurrencyHolding = getCurrenyHolding(newHoldings, trade.soldCurrency, trade.amountSold);
        newHoldings = result.newHoldings;
        if (trade.boughtCurrency in newHoldings === false) {
            newHoldings[trade.boughtCurrency] = [];
        }
        newHoldings[trade.boughtCurrency].push({
            amount: trade.amountSold / trade.rate,
            rateInUSD: trade.USDRate * trade.rate,
            date: new Date().getTime(),
        });
        for (const holding of result.deductedHoldings) {
            const gain: number = (trade.USDRate - holding.rateInUSD) * holding.amount;

            if (trade.date - holding.date > FULL_YEAR_IN_MILLISECONDS) {
                longTermGain += gain;
            } else {
                shortTermGain += gain;
            }
        }
    }
    return {
        newHoldings,
        longTermGain,
        shortTermGain,
    };
}

export interface IGetCurrencyHolding {
    deductedHoldings: ICurrencyHolding[];
    newHoldings: IHoldings;
}

export function getCurrenyHolding(
    holdings: IHoldings, currency: string, amount: number, method?: METHOD,
): IGetCurrencyHolding {
    holdings = clone(holdings);
    const currencyHolding: ICurrencyHolding[] = [];
    let amountUsed: number = amount;
    while (amountUsed !== 0) {
        if (currency in holdings) {
            switch (method) {
                case METHOD.LIFO:
                    const lastIn: ICurrencyHolding = holdings[currency][holdings[currency].length - 1];
                    if (lastIn.amount > amountUsed) {
                        lastIn.amount = lastIn.amount - amountUsed;
                        currencyHolding.push({
                            amount: amountUsed,
                            rateInUSD: lastIn.rateInUSD,
                            date: lastIn.date,
                        });
                        amountUsed = 0;
                    } else {
                        amountUsed = amountUsed - lastIn.amount;
                        const popped = holdings[currency].pop();
                        if (popped !== undefined) {
                            currencyHolding.push(popped);
                        }
                    }
                    break;
                case METHOD.HCFO:
                    // return '';
                case METHOD.FIFO:
                default:
                    const firstIn: ICurrencyHolding = holdings[currency][0];
                    if (firstIn.amount > amountUsed) {
                        firstIn.amount = firstIn.amount - amountUsed;
                        currencyHolding.push({
                            amount: amountUsed,
                            rateInUSD: firstIn.rateInUSD,
                            date: firstIn.date,
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
                date: new Date().getTime(),
                rateInUSD: 0,
            });
            amountUsed = 0;
        }
    }
    return {
        deductedHoldings: currencyHolding,
        newHoldings: holdings,
    };
}

export function calculateGainPerTrade(internalFormat: ITradeWithUSDRate[], holdings: IHoldings): ITradeWithGains[] {
    let tempHoldings: IHoldings = clone(holdings);
    const finalFormat: ITradeWithGains[] = [];
    for (const trade of internalFormat) {
        const result: ICalculateGains = calculateGains(tempHoldings, [trade]);
        tempHoldings = result.newHoldings;
        finalFormat.push({
            ...trade,
            shortTerm: result.shortTermGain,
            longTerm: result.longTermGain,
        });
    }
    return finalFormat;
}

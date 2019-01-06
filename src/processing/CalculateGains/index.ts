import * as clone from 'clone';
import {
    IHoldings,
    ITradeWithCostBasis,
    ITradeWithFiatRate,
    ITradeWithGains,
    METHOD,
} from '../../types';
import holdingSelection from '../HoldingSelection';

const FULL_YEAR_IN_MILLISECONDS = 31536000000;

export interface ICalculateGains {
    newHoldings: IHoldings;
    longTermGain: number;
    shortTermGain: number;
}

export function calculateGains(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD = METHOD.FIFO,
): ICalculateGains {
    let shortTermGain = 0;
    let longTermGain = 0;
    let newHoldings: IHoldings = clone(holdings);
    for (const trade of trades) {
        const result = holdingSelection(
            newHoldings, trade, fiatCurrency, method,
        );
        newHoldings = result.newHoldings;
        if (!(trade.boughtCurrency in newHoldings)) {
            newHoldings[trade.boughtCurrency] = [];
        }
        if (trade.soldCurrency === fiatCurrency) {
            newHoldings[trade.boughtCurrency].push({
                amount: trade.amountSold / trade.rate,
                rateInFiat: trade.fiatRate,
                date: trade.date,
            });
            continue;
        } else {
            let gain = 0;
            let amountToAdd = trade.amountSold / trade.rate;
            switch (trade.transactionFeeCurrency) {
                case trade.boughtCurrency:
                    gain -= trade.transactionFee * trade.rate * trade.fiatRate;
                    amountToAdd -= trade.transactionFee;
                    break;
                case trade.soldCurrency:
                    gain -= trade.transactionFee * trade.fiatRate;
                    amountToAdd -= trade.transactionFee / trade.rate;
                    break;
                default:
            }

            newHoldings[trade.boughtCurrency].push({
                amount: amountToAdd,
                rateInFiat: trade.fiatRate * trade.rate,
                date: trade.date,
            });

            for (const holding of result.deductedHoldings) {
                gain += (trade.fiatRate - holding.rateInFiat) * holding.amount;

                if (trade.date - holding.date > FULL_YEAR_IN_MILLISECONDS) {
                    longTermGain += gain;
                } else {
                    shortTermGain += gain;
                }
            }
        }
    }
    return {
        newHoldings,
        longTermGain,
        shortTermGain,
    };
}

export interface ICalculateGainsPerTrade {
    trades: ITradeWithGains[];
    holdings: IHoldings;
    shortTerm: number;
    longTerm: number;
}

export function calculateGainPerTrade(
    holdings: IHoldings,
    internalFormat: ITradeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD,
): ICalculateGainsPerTrade {
    let tempHoldings: IHoldings = clone(holdings);
    let shortTerm = 0;
    let longTerm = 0;
    const finalFormat: ITradeWithGains[] = [];
    for (const trade of internalFormat) {
        const result: ICalculateGains = calculateGains(tempHoldings, [trade], fiatCurrency, method);
        tempHoldings = result.newHoldings;
        shortTerm += result.shortTermGain;
        longTerm += result.longTermGain;
        finalFormat.push({
            ...trade,
            shortTerm: result.shortTermGain,
            longTerm: result.longTermGain,
        });
    }
    return {
        trades: finalFormat,
        holdings: tempHoldings,
        shortTerm,
        longTerm,
    };
}

export interface ICalculateGainsPerHoldings {
    shortTermTrades: ITradeWithCostBasis[];
    longTermTrades: ITradeWithCostBasis[];
    longTermGain: number;
    longTermProceeds: number;
    longTermCostBasis: number;
    shortTermGain: number;
    shortTermProceeds: number;
    shortTermCostBasis: number;
    holdings: IHoldings;
}

export function calculateGainsPerHoldings(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD,
): ICalculateGainsPerHoldings {
    let newHoldings: IHoldings = clone(holdings);
    let shortTermGain = 0;
    let shortTermProceeds = 0;
    let shortTermCostBasis = 0;
    let longTermGain = 0;
    let longTermProceeds = 0;
    let longTermCostBasis = 0;
    const shortTermTrades: ITradeWithCostBasis[] = [];
    const longTermTrades: ITradeWithCostBasis[] = [];
    for (const trade of trades) {
        const result = holdingSelection(newHoldings, trade, fiatCurrency, method);
        newHoldings = result.newHoldings;
        if (!(trade.boughtCurrency in newHoldings)) {
            newHoldings[trade.boughtCurrency] = [];
        }
        if (trade.soldCurrency === fiatCurrency) {
            newHoldings[trade.boughtCurrency].push({
                amount: trade.amountSold / trade.rate,
                rateInFiat: trade.fiatRate,
                date: trade.date,
            });
            continue;
        } else {
            newHoldings[trade.boughtCurrency].push({
                amount: trade.amountSold / trade.rate,
                rateInFiat: trade.fiatRate * trade.rate,
                date: trade.date,
            });
        }
        for (const holding of result.deductedHoldings) {
            const tradeToAdd: ITradeWithCostBasis = {
                fiatRate: trade.fiatRate,
                boughtCurrency: trade.boughtCurrency,
                soldCurrency: trade.soldCurrency,
                amountSold: holding.amount,
                rate: trade.rate,
                date: trade.date,
                ID: trade.ID,
                exchangeID: trade.exchangeID,
                exchange: trade.exchange,
                transactionFee: trade.transactionFee,
                transactionFeeCurrency: trade.transactionFeeCurrency,
                shortTerm: 0,
                longTerm: 0,
                dateAcquired: holding.date,
                costBasis: parseFloat((holding.rateInFiat * holding.amount).toFixed(2)),
            };
            const unFixedGain = (trade.fiatRate - holding.rateInFiat) * holding.amount;
            let trueGain = parseFloat(unFixedGain.toFixed(2));
            if (parseFloat(unFixedGain.toFixed(2)) === 0) {
                if (unFixedGain === 0) {
                    trueGain = 0;
                } else {
                    if (unFixedGain > 0) {
                        trueGain = 0.01;
                    } else {
                        trueGain = -0.01;
                    }
                }
            }
            const gain: number = trueGain;
            if (trade.date - holding.date > FULL_YEAR_IN_MILLISECONDS) {
                longTermProceeds += tradeToAdd.fiatRate * tradeToAdd.amountSold;
                longTermCostBasis += tradeToAdd.costBasis;
                longTermGain += gain;
                tradeToAdd.longTerm = gain;
                longTermTrades.push(tradeToAdd);
            } else {
                shortTermProceeds += tradeToAdd.fiatRate * tradeToAdd.amountSold;
                shortTermCostBasis += tradeToAdd.costBasis;
                shortTermGain += gain;
                tradeToAdd.shortTerm = gain;
                shortTermTrades.push(tradeToAdd);
            }
        }
    }
    return {
        shortTermTrades,
        longTermTrades,
        shortTermGain,
        longTermGain,
        shortTermProceeds,
        longTermProceeds,
        shortTermCostBasis,
        longTermCostBasis,
        holdings: newHoldings,
    };
}

import * as clone from 'clone';
import { ITradeWithFiatRate, IHoldings, METHOD, ITradeWithCostBasis } from './../../types';
import holdingSelection from '../HoldingSelection';

const FULL_YEAR_IN_MILLISECONDS = 31536000000;

export interface IProcessTrade {
    holdings: IHoldings;
    costBasisTrades: ITradeWithCostBasis[];
    shortTermGain: number;
    longTermGain: number;
    shortTermCostBasis: number;
    longTermCostBasis: number;
    shortTermProceeds: number;
    longTermProceeds: number;
}

export function processTrade(
    holdings: IHoldings,
    trade: ITradeWithFiatRate,
    fiatCurrency: string,
    method: METHOD = METHOD.FIFO,
): IProcessTrade {
    let shortTermGain = 0;
    let shortTermProceeds = 0;
    let shortTermCostBasis = 0;
    let longTermGain = 0;
    let longTermProceeds = 0;
    let longTermCostBasis = 0;
    const tradesWithCostBasis = [];
    let newHoldings: IHoldings = clone(holdings); // to avoid a change effecting state holdings

    const result = holdingSelection(
        newHoldings, trade, fiatCurrency, method,
    );
    newHoldings = result.newHoldings;

    // make sure bought currency key exists in holdings
    if (!(trade.boughtCurrency in newHoldings)) {
        newHoldings[trade.boughtCurrency] = [];
    }

    if (trade.soldCurrency === fiatCurrency) {
        // fiat current so add new holdings
        newHoldings[trade.boughtCurrency].push({
            amount: trade.amountSold / trade.rate,
            rateInFiat: trade.fiatRate,
            date: trade.date,
        });
    } else {
        let feeFiatCost = 0;
        let amountToAdd = trade.amountSold / trade.rate;
        switch (trade.transactionFeeCurrency) {
            case trade.boughtCurrency:
                feeFiatCost += trade.transactionFee * trade.rate * trade.fiatRate;
                amountToAdd -= trade.transactionFee;
                break;
            case trade.soldCurrency:
                feeFiatCost += trade.transactionFee * trade.fiatRate;
                amountToAdd -= trade.transactionFee / trade.rate;
                break;
            default:
        }

        if (amountToAdd > 0) {
            newHoldings[trade.boughtCurrency].push({
                amount: amountToAdd,
                rateInFiat: trade.fiatRate * trade.rate,
                date: trade.date,
            });
        }

        for (const holding of result.deductedHoldings) {
            let gain = (trade.fiatRate - holding.rateInFiat) * holding.amount;

            const feeCost = holding.amount / trade.amountSold * feeFiatCost;

            gain -= feeCost;

            const fixedGain = parseFloat(gain.toFixed(2));
            if (fixedGain === 0) {
                if (gain !== 0) {
                    if (gain > 0) {
                        gain = 0.01;
                    } else {
                        gain = -0.01;
                    }
                }
            }

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
                longtermTrade: false,
            };
            if (trade.date - holding.date > FULL_YEAR_IN_MILLISECONDS) {
                tradeToAdd.longtermTrade = true;
                longTermGain += gain;
                longTermProceeds += tradeToAdd.fiatRate * tradeToAdd.amountSold;
                longTermCostBasis += tradeToAdd.costBasis;
                tradeToAdd.longTerm = gain;
            } else {
                shortTermGain += gain;
                shortTermProceeds += tradeToAdd.fiatRate * tradeToAdd.amountSold;
                shortTermCostBasis += tradeToAdd.costBasis;
                tradeToAdd.shortTerm = gain;
            }

            tradesWithCostBasis.push(tradeToAdd);
        }
    }
    return {
        holdings: newHoldings,
        costBasisTrades: tradesWithCostBasis,
        shortTermGain,
        longTermGain,
        shortTermCostBasis,
        longTermCostBasis,
        shortTermProceeds,
        longTermProceeds,
    };
};
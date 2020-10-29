import clone from 'clone';
import holdingSelection from '../HoldingSelection';
import { IHoldings, ITradeWithCostBasis, ITradeWithFiatRate, METHOD } from './../../types';

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
            location: trade.exchange,
        });
    } else {
        let feeFiatCost = 0;
        let amountToAdd = trade.amountSold / trade.rate;

        if (trade.transactionFee) {
            switch (trade.transactionFeeCurrency) {
                case trade.boughtCurrency:
                    feeFiatCost += trade.transactionFee * trade.rate * trade.fiatRate;
                    amountToAdd -= trade.transactionFee;
                    break;
                case trade.soldCurrency:
                    feeFiatCost += trade.transactionFee * trade.fiatRate;
                    amountToAdd -= trade.transactionFee / trade.rate;
                    break;
                case fiatCurrency:
                    feeFiatCost += trade.transactionFee;
                    amountToAdd -= trade.transactionFee / trade.fiatRate;
                    break;
                default:
            }
        }

        if (amountToAdd > 0.000000001) {
            newHoldings[trade.boughtCurrency].push({
                amount: amountToAdd,
                rateInFiat: trade.fiatRate * trade.rate,
                date: trade.date,
                location: trade.exchange,
            });
        }

        for (const holding of result.deductedHoldings) {
            let gain = (trade.fiatRate - holding.rateInFiat) * holding.amount;

            if (feeFiatCost) {
                const feeCost = holding.amount / trade.amountSold * feeFiatCost;
                gain -= feeCost;
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
                costBasis: holding.rateInFiat * holding.amount,
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
}

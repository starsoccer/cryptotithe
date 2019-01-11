import * as clone from 'clone';
import {
    IHoldings,
    ITradeWithCostBasis,
    ITradeWithFiatRate,
    ITradeWithGains,
    METHOD,
} from '../../types';
import { processTrade } from '../ProcessTrade';

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
    let newHoldings: IHoldings = holdings;
    for (const trade of trades) {
        const result = processTrade(newHoldings, trade, fiatCurrency, method);
        shortTermGain += result.shortTermGain;
        longTermGain += result.longTermGain;
        newHoldings = result.holdings;
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
    let newHoldings: IHoldings = holdings;
    let shortTermGain = 0;
    let shortTermProceeds = 0;
    let shortTermCostBasis = 0;
    let longTermGain = 0;
    let longTermProceeds = 0;
    let longTermCostBasis = 0;
    const shortTermTrades: ITradeWithCostBasis[] = [];
    const longTermTrades: ITradeWithCostBasis[] = [];
    for (const trade of trades) {
        const result = processTrade(newHoldings, trade, fiatCurrency, method);
        shortTermGain += result.shortTermGain;
        longTermGain += result.longTermGain;
        longTermProceeds += result.longTermProceeds;
        longTermCostBasis += result.longTermCostBasis;
        shortTermProceeds += result.shortTermProceeds;
        shortTermCostBasis += result.shortTermCostBasis;
        newHoldings = result.holdings;

        result.costBasisTrades.forEach((costBasisTrade) => {
            if (costBasisTrade.longtermTrade) {
                longTermTrades.push(costBasisTrade);
            } else {
                shortTermTrades.push(costBasisTrade);
            }
        });
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

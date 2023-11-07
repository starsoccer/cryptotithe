import {
    IHoldings,
    IIncomeWithFiatRate,
    ITradeWithCostBasis,
    ITradeWithFiatRate,
    ITradeWithGains,
    METHOD,
} from '../../types';

export interface ICalculateGains {
    newHoldings: IHoldings;
    longTermGain: number;
    shortTermGain: number;
}

export async function calculateGains(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    incomes: IIncomeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD = METHOD.FIFO,
): Promise<ICalculateGains> {
    const wasm = await import('cryptotithe-wasm');
  
    return wasm.calculate_gains_wasm(holdings, trades, incomes, fiatCurrency, method);
}

export interface ICalculateGainsPerTrade {
    trades: ITradeWithGains[];
    holdings: IHoldings;
    shortTerm: number;
    longTerm: number;
}

export async function calculateGainPerTrade(
    holdings: IHoldings,
    internalFormat: ITradeWithFiatRate[],
    incomes: IIncomeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD,
): Promise<ICalculateGainsPerTrade> {
    const wasm = await import('cryptotithe-wasm');
    return wasm.calculate_gains_per_trade_wasm(holdings, internalFormat, incomes, fiatCurrency, method);
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

export async function calculateGainsPerHoldings(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    incomes: IIncomeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD,
): Promise<ICalculateGainsPerHoldings> {
    const wasm = await import('cryptotithe-wasm');
    return wasm.calculate_gain_per_holdings_wasm(holdings, trades, incomes, fiatCurrency, method);
}

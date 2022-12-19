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
    const test = await import('cryptotithe-wasm');
  
    const q: any = test.calculate_gains_wasm(holdings, trades, incomes, fiatCurrency, method);

    return q;
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

    const t0 = performance.now();

    const test = await import('cryptotithe-wasm');
    const q: any = test.calculate_gains_per_trade_wasm(holdings, internalFormat, incomes, fiatCurrency, method);

    const t1 = performance.now();
    console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
    console.log(q);
    return q;
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
    const test = await import('cryptotithe-wasm');
    const q: any = test.calculate_gain_per_holdings_wasm(holdings, trades, incomes, fiatCurrency, method);
    return q;
}

export interface IHoldings {
    [key: string]: ICurrencyHolding[];
}

export interface ICurrencyHolding {
    amount: number;
    rateInFiat: number;
    date: number;
}

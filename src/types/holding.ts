import { ISimplifiedHoldingsWithValue } from './';

export interface IHoldings {
    [key: string]: ICurrencyHolding[];
}

export interface ICurrencyHolding {
    amount: number;
    rateInFiat: number;
    date: number;
}

export interface IHoldingsValue {
    currencies: {
        [key: string]: ISimplifiedHoldingsWithValue
    };
    total: number;
}
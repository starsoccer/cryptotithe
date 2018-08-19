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
        [key: string]: ISimplifiedHoldingsWithValue,
    };
    total: number;
}

export interface IHoldingsValueComplex {
    currencies: {
        [key: string]: IComplexHoldingsWithValue,
    };
    fiatTotal: number;
    BTCTotal: number;
}

export interface IComplexHoldingsWithValue {
    fiatValue: number;
    BTCValue: number;
    BTCRate: number;
    fiatRate: number;
    BTCChange: number;
    fiatChange: number;
    amount: number;
}

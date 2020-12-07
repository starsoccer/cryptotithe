import { IDuplicate } from "./import";

export interface IIncome {
    amount: number;
    currency: string;
    transactionID?: string;
    ID: string;
    fee?: number;
    date: number;
}

export interface IIncomeWithFiatRate extends IIncome {
    fiatRate: number;
}

export interface IIncomeWithGains extends IIncome {
    shortTerm: number;
    longTerm: number;
}

export interface IIncomeWithDuplicateProbability extends IIncome, IDuplicate {}

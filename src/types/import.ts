import { Location } from '.';

export enum ImportType {
    TRADES = 'TRADES',
    TRANSACTION = 'TRANSACTIONS',
    INCOME = 'INCOME',
}

export enum TransactionImportType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWL = 'WITHDRAWAL',
    BOTH = 'BOTH',
}

export interface IImport {
    type: ImportType;
    subtype?: TransactionImportType;
    currency?: string;
    location: Location;
    data: string;
}

export interface IDuplicate {
    duplicate: boolean;
    probability: number;
    ID: string;
}

import { IDuplicate, Location } from './';

export interface ITransaction {
    from: Location;
    fromAddress?: string;
    to: Location;
    toAddress?: string;
    amount: number;
    currency: string;
    ID: string;
    transactionID?: string;
    fee?: number;
    date: number;
}

export interface ITransactionWithDuplicateProbability extends ITransaction, IDuplicate {}

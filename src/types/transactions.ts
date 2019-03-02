import { ICurrencyHolding, Location } from './';

export interface ITransaction {
    from: Location;
    fromAddress?: string;
    to: Location;
    toAddress?: string;
    holdings: ICurrencyHolding[];
    currency: string;
    id: string;
    transactionID?: string;
    fee?: number;
    date: number;
}

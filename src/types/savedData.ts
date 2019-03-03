import { FiatRateMethod, IHoldings, ITradeWithFiatRate, ITransaction, METHOD } from './';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    version: string;
    trades: ITradeWithFiatRate[];
    transactions: ITransaction[];
    holdings: IHoldings;
    settings: ISettings;
    integrity: string;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithFiatRate[];
    transactions?: ITransaction[];
    holdings?: IHoldings;
    settings?: Partial<ISettings>;
    integrity?: string;
    version?: string;
}

export interface ISettings {
    fiatRateMethod: FiatRateMethod;
    fiatCurrency: string;
    gainCalculationMethod: METHOD;
}

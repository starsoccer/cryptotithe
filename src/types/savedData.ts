import { FiatRateMethod, IHoldings, ITradeWithFiatRate, ITransaction, METHOD } from './';
import { IIncomeWithFiatRate } from './income';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    version: string;
    trades: ITradeWithFiatRate[];
    transactions: ITransaction[];
    incomes: IIncomeWithFiatRate[],
    holdings: IHoldings;
    settings: ISettings;
    integrity: string;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithFiatRate[];
    transactions?: ITransaction[];
    incomes?: IIncomeWithFiatRate[];
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

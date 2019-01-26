import { FiatRateMethod, METHOD } from './';
import { IHoldings } from './holding';
import { ITradeWithFiatRate } from './trade';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    version: string;
    trades: ITradeWithFiatRate[];
    holdings: IHoldings;
    settings: ISettings;
    integrity: string;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithFiatRate[];
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

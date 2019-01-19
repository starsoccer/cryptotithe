import { FiatRateMethod, METHOD } from './';
import { IHoldings } from './holding';
import { ITradeWithFiatRate } from './trade';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    version: string;
    trades: ITradeWithFiatRate[];
    holdings: IHoldings;
    settings: ISettings;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithFiatRate[];
    holdings?: IHoldings;
    settings?: Partial<ISettings>;
}

export interface ISettings {
    fiatRateMethod: keyof typeof FiatRateMethod;
    fiatCurrency: string;
    gainCalculationMethod: METHOD;
}

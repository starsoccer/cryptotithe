import { FiatRateMethod } from './';
import { IHoldings } from './holding';
import { ITradeWithFiatRate } from './trade';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    version?: number;
    trades: ITradeWithFiatRate[];
    holdings: IHoldings;
    settings: ISettings;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithFiatRate[];
    holdings?: IHoldings;
    settings?: ISettings;
}

export interface ISettings {
    fiatRateMethod: keyof typeof FiatRateMethod;
    fiatCurrency: string;
}

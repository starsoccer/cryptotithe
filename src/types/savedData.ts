import { ITradeWithUSDRate } from './trade';
import { IHoldings } from './holding';
import { FiatRateMethod } from './';

export interface ISavedData extends IPartialSavedData {
    savedDate: Date;
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
    settings: ISettings;
}

export interface IPartialSavedData {
    savedDate?: Date;
    trades?: ITradeWithUSDRate[];
    holdings?: IHoldings;
    settings?: ISettings;
}

export interface ISettings {
    fiatRateMethod: keyof typeof FiatRateMethod;
}
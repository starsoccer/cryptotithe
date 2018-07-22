import { FiatRateMethod } from './';
import { IHoldings } from './holding';
import { ITradeWithUSDRate } from './trade';

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

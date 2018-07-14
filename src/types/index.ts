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
    fiatRateMethod?: keyof typeof FiatRateMethod;
}

export interface IHoldings {
    [key: string]: ICurrencyHolding[];
}

export interface ICurrencyHolding {
    amount: number;
    rateInUSD: number;
    date: number;
}

export interface IPartialTrade {
    boughtCurrency?: string;
    soldCurrency?: string;
    amountSold?: number;
    rate?: number;
    date?: number;
    id?: string;
    exchange?: EXCHANGES;
}

export interface ITrade extends IPartialTrade {
    boughtCurrency: string;
    soldCurrency: string;
    amountSold: number;
    rate: number;
    date: number;
    id: string;
    exchange: EXCHANGES;
}

export interface ITradeWithUSDRate extends ITrade {
    USDRate: number;
}

export interface ITradeWithGains extends ITradeWithUSDRate {
    shortTerm: number;
    longTerm: number;
}

export interface ITradeWithCostBasis extends ITradeWithGains {
    dateAcquired: number;
    costBasis: number;
}

export interface ITradeWithDuplicateProbability extends ITrade {
    probability: number;
    duplicate: boolean;
}

export enum METHOD {
    LIFO = 'LIFO',
    FIFO = 'FIFO',
    HCFO = 'HCFO',
}

export enum FiatRateMethod {
    DOUBLEAVERAGE = 'Double Average',
    BITCOINAVERAGE = 'Bitcoin Average',
    HOURAVG = 'Hour Avg', // open, close, high, low averaged
    HOURHIGH = 'Hour High',
    HOURLOW= 'Hour Low',
    HOURCLOSE = 'Hour Close',
    HOUROPEN = 'Hour Open',
    DAYAVERAGE = 'Day Average',
}

export enum EXCHANGES {
    BITTREX = 'Bittrex',
    GEMINI = 'Gemini',
    POLONIEX = 'Poloniex',
    KRAKEN = 'Kraken',
}

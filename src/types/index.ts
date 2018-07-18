export interface IDailyBalance {
    date: Date;
    holdings: {[key: string]: ISimplifiedHoldingsWithValue};
    USDValue: number;
}

export interface ISimplifiedHoldingsWithValue {
    fiatValue: number;
    amount: number;
}

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
    FIFO = 'FIFO',
    LIFO = 'LIFO',
    HCFO = 'HCFO',
    LCFO = 'LCFO',
    LTFO = 'LTFO',
    HTFO = 'HTFO',
}

export enum FiatRateMethod {
    DOUBLEAVERAGE = 'Double Average',
    HOURAVG = 'Hour Avg', // open, close, high, low averaged
    HOURHIGH = 'Hour High',
    HOURLOW= 'Hour Low',
    HOURCLOSE = 'Hour Close',
    HOUROPEN = 'Hour Open',
    DAYAVERAGE = 'Day Average',
    DAYAVERAGEMID = 'Day Average Middle',
    DAYAVERAGEVOLUME = 'Day Average Volume',
}

export enum EXCHANGES {
    BITTREX = 'Bittrex',
    GEMINI = 'Gemini',
    POLONIEX = 'Poloniex',
    KRAKEN = 'Kraken',
    BINANCE = 'Binance',
}

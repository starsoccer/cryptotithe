export enum EXCHANGES {
    BITTREX = 'Bittrex',
    GEMINI = 'Gemini',
    POLONIEX = 'Poloniex',
    KRAKEN = 'Kraken',
    BINANCE = 'Binance',
}

export enum ExchangesHeaders {
    BITTREX = '07230399aaa8d1f15e88e38bd43a01c5ef1af6c1f9131668d346e196ff090d80',
    GEMINI = '996edee25db7f3d1dd16c83c164c6cff8c6d0f5d6b3aafe6d1700f2a830f6c9e',
    POLONIEX = 'd7484d726e014edaa059c0137ac91183a7eaa9ee5d52713aa48bb4104b01afb0',
    KRAKEN = '85bf27e799cc0a30fe5b201cd6a4724e4a52feb433f41a1e8b046924e3bf8dc5',
    BINANCE = '4d0d5df894fe488872e513f6148dfa14ff29272e759b7fb3c86d264687a7cf99',
}

export type IPartialTrade = Partial<ITrade>;

export interface ITrade {
    boughtCurrency: string;
    soldCurrency: string;
    amountSold: number;
    rate: number;
    date: number;
    exchangeID: string;
    exchange: EXCHANGES;
    ID: string;
    transactionFee: number;
    transactionFeeCurrency: string;
}

export interface ITradeWithFiatRate extends ITrade {
    fiatRate: number;
}

export interface ITradeWithGains extends ITradeWithFiatRate {
    shortTerm: number;
    longTerm: number;
}

export interface ITradeWithCostBasis extends ITradeWithGains {
    dateAcquired: number;
    costBasis: number;
    longtermTrade: boolean;
}

export interface ITradeWithDuplicateProbability extends ITrade {
    probability: number;
    duplicate: boolean;
}

export enum EXCHANGES {
    BITTREX = 'Bittrex',
    GEMINI = 'Gemini',
    POLONIEX = 'Poloniex',
    KRAKEN = 'Kraken',
    BINANCE = 'Binance',
}

export enum ExchangesHeaders {
    BITTREX = '07230399aaa8d1f15e88e38bd43a01c5ef1af6c1f9131668d346e196ff090d80',
    GEMINI = '9d324bebad54408dd639d87a3a99f83291c0ebe1c2656531d1bf2fbee2a6301f',
    POLONIEX = 'd7484d726e014edaa059c0137ac91183a7eaa9ee5d52713aa48bb4104b01afb0',
    KRAKEN = '85bf27e799cc0a30fe5b201cd6a4724e4a52feb433f41a1e8b046924e3bf8dc5',
    BINANCE = '4d0d5df894fe488872e513f6148dfa14ff29272e759b7fb3c86d264687a7cf99',
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

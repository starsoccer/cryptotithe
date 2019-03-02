export type Location = EXCHANGES | string;

export enum EXCHANGES {
    Bittrex = 'BITTREX',
    Gemini= 'GEMINI',
    Poloniex = 'POLONIEX',
    Kraken = 'KRAKEN',
    Binance = 'BINANCE',
}

export enum ExchangesTradeHeaders {
    BITTREX = '07230399aaa8d1f15e88e38bd43a01c5ef1af6c1f9131668d346e196ff090d80',
    GEMINI = '996edee25db7f3d1dd16c83c164c6cff8c6d0f5d6b3aafe6d1700f2a830f6c9e',
    POLONIEX = 'd7484d726e014edaa059c0137ac91183a7eaa9ee5d52713aa48bb4104b01afb0',
    KRAKEN = '85bf27e799cc0a30fe5b201cd6a4724e4a52feb433f41a1e8b046924e3bf8dc5',
    BINANCE = '4d0d5df894fe488872e513f6148dfa14ff29272e759b7fb3c86d264687a7cf99',
}

import { EXCHANGES, ExchangesTradeHeaders, IImport, ITrade } from '@types';
import * as crypto from 'crypto';
import binanceParser from './binance';
import bittrexParser from './bittrex';
import geminiParser from './gemini';
import krakenParser from './kraken';
import liquidParser from './liquid';
import poloniexParser from './poloniex';
import revolutParser from './revolut';

type ImportType = (importDetails: IImport) => Promise<ITrade[]>;

const parserMapping: {[key in EXCHANGES]: ImportType} = {
    [EXCHANGES.Binance]: binanceParser,
    [EXCHANGES.Bittrex]: bittrexParser,
    [EXCHANGES.Gemini]: geminiParser,
    [EXCHANGES.Kraken]: krakenParser,
    [EXCHANGES.Liquid]: liquidParser,
    [EXCHANGES.Poloniex]: poloniexParser,
    [EXCHANGES.Revolut]: revolutParser,
}

export default async function processTradesImport(importDetails: IImport): Promise<ITrade[] | string> {
    if (importDetails.location in parserMapping) {
        const parser = parserMapping[importDetails.location];
        return await parser(importDetails);
    } else {
        const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
        const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
        for (const key in ExchangesTradeHeaders) {
            if (ExchangesTradeHeaders[key].split(';').includes(headersHash)) {
                if (key === EXCHANGES.Liquid && importDetails.data2 === '') {
                    return 'Liquid trades';
                }
                return processTradesImport({
                    ...importDetails,
                    location: key,
                });
            }
        }
        throw new Error(`Unknown Exchange - ${importDetails.location} - ${headersHash}`);
        return [];
    }
}

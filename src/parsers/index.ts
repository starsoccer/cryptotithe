import * as crypto from 'crypto';
import * as papaparse from 'papaparse';
import { EXCHANGES, ExchangesTradeHeaders, ITrade } from '../types';

interface IGetCSVData {
    [key: string]: string;
}

export async function getCSVData(fileData: string): Promise<any> {
    return new Promise((
        resolve: (data: IGetCSVData[]) => void,
        reject: (Error: papaparse.ParseError[]) => void,
    ): any => {
        papaparse.parse(fileData, {
            worker: true,
            header: true,
            complete: (result) => {
                if (result.meta.aborted) {
                    reject(result.errors);
                } else {
                    // make sure last row isnt just one key being empty
                    if (Object.keys(result.data[0]) !== Object.keys(result.data[result.data.length - 1])) {
                        result.data.pop();
                    }
                    resolve(result.data);
                }
            },
            error: (error) => {
                reject([error]);
            },
        });
    });
}

export async function processData(exchange: EXCHANGES | string, fileData: string): Promise<ITrade[]> {
    let processExchangeData: (fileData: string) => ITrade[];
    switch (exchange) {
        case EXCHANGES.Bittrex:
            processExchangeData = require('./bittrex').processData;
            break;
        case EXCHANGES.Gemini:
            processExchangeData = require('./gemini').processData;
            break;
        case EXCHANGES.Poloniex:
            processExchangeData = require('./poloniex').processData;
            break;
        case EXCHANGES.Kraken:
            processExchangeData = require('./kraken').processData;
            break;
        case EXCHANGES.Binance:
            processExchangeData = require('./binance').processData;
            break;
        default:
            const headers = fileData.substr(0, fileData.indexOf('\n'));
            const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
            for (const key in ExchangesTradeHeaders) {
                if (ExchangesTradeHeaders[key] === headersHash) {
                    return processData(key, fileData);
                }
            }
            throw new Error(`Unknown Exchange - ${exchange} - ${headersHash}`);
            return [];
    }
    if (typeof processExchangeData === 'function') {
        return processExchangeData(fileData);
    }
    return [];
}

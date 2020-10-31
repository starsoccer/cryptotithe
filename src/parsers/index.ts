import * as crypto from 'crypto';
import * as papaparse from 'papaparse';
import { EXCHANGES, ExchangesTradeHeaders, ImportType, ITrade } from '../types';
import { IImport } from './../types/import';
import { ITransaction } from './../types/transactions';

interface IGetCSVData {
    [key: string]: string;
}

export async function getCSVData(fileData: string): Promise<any> {
    return new Promise((
        resolve: (data: IGetCSVData[]) => void,
        reject: (Error: papaparse.ParseError[]) => void,
    ): any => {
        papaparse.parse(fileData, {
            // worker: true, // disabling as firefox throws error and wont load
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

export function processData(importDetails: IImport): ITrade[]  | ITransaction[] {
    switch (importDetails.type) {
        case ImportType.TRADES:
            return processTradesImport(importDetails);
        case ImportType.TRANSACTION:
            return processTransactionsImport(importDetails);
        default:
            throw new Error(`Unknown Import Type - ${importDetails.type}`);
    }
}

function processTransactionsImport(importDetails: IImport): ITransaction[] {
    let processExchangeData: (importDetails: IImport) => ITransaction[];
    switch (importDetails.location) {
        case EXCHANGES.Binance: {
            // eslint-disable-next-line
            processExchangeData = require('./transactions/binance').processData;
            break;
        }
        default: {
            const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
            const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
            throw new Error(`Unknown Exchange - ${importDetails.location} - ${headersHash}`);
            return [];
        }
    }
    if (typeof processExchangeData === 'function') {
        return processExchangeData(importDetails);
    }
    return [];
}

function processTradesImport(importDetails: IImport): ITrade[] {
    let processExchangeData: (importDetails: IImport) => ITrade[];
    switch (importDetails.location) {
        case EXCHANGES.Bittrex: {
            // eslint-disable-next-line
            processExchangeData = require('./trades/bittrex').processData;
            break;
        }
        case EXCHANGES.Gemini: {
            // eslint-disable-next-line
            processExchangeData = require('./trades/gemini').processData;
            break;
        }
        case EXCHANGES.Poloniex: {
            // eslint-disable-next-line
            processExchangeData = require('./trades/poloniex').processData;
            break;
        }
        case EXCHANGES.Kraken: {
            // eslint-disable-next-line
            processExchangeData = require('./trades/kraken').processData;
            break;
        }
        case EXCHANGES.Binance: {
            // eslint-disable-next-line
            processExchangeData = require('./trades/binance').processData;
            break;
        }
        default: {
            const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
            const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
            for (const key in ExchangesTradeHeaders) {
                if (ExchangesTradeHeaders[key] === headersHash) {
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
    if (typeof processExchangeData === 'function') {
        return processExchangeData(importDetails);
    }
    return [];
}

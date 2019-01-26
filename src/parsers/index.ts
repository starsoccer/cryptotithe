import * as crypto from 'crypto';
import * as csv from 'csvtojson';
import { EXCHANGES, ExchangesHeaders, ITrade } from '../types';

interface IGetCSVData {
    [key: string]: string;
}

export async function getCSVData(fileData: string): Promise<any> {
    return new Promise((resolve: (data: IGetCSVData[][]) => void, reject: (Error: Error) => void): any => {
        const promises: Array<Promise<IGetCSVData[]>> = [];
        csv().fromString(fileData)
          .on('json', (converted: IGetCSVData[]) => promises.push(Promise.resolve(converted)))
          .on('done', (error: Error) => {
            if (error) {
              reject(error);
            }
            Promise.all(promises).then(resolve);
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
            for (const key in ExchangesHeaders) {
                if (ExchangesHeaders[key] === headersHash) {
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

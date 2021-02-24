import * as crypto from 'crypto';
import * as papaparse from 'papaparse';
import { EXCHANGES, IIncome, ImportType, IncomeImportTypes, ITrade } from '../types';
import { IImport } from './../types/import';
import { ITransaction } from './../types/transactions';
import processTradesImport from './trades';

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
            complete: (result: papaparse.ParseResult<any>) => {
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

export async function processData(importDetails: IImport): Promise<ITrade[]  | ITransaction[] | IIncome[]> {
    switch (importDetails.type) {
        case ImportType.TRADES:
            return await processTradesImport(importDetails);
        case ImportType.TRANSACTION:
            return processTransactionsImport(importDetails);
        case ImportType.INCOME:
            return processIncomesImport(importDetails);
        default:
            throw new Error(`Unknown Import Type - ${importDetails.type}`);
    }
}

function processIncomesImport(importDetails: IImport): IIncome[] {
    let processExchangeData: (importDetails: IImport) => IIncome[];
    switch (importDetails.location) {
        case IncomeImportTypes.cryptoID: {
            // eslint-disable-next-line
            processExchangeData = require('./incomes/cryptoID').processData;
            break;
        }
        default: {
            const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
            const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
            throw new Error(`Unknown Income Type - ${importDetails.location} - ${headersHash}`);
            return [];
        }
    }
    if (typeof processExchangeData === 'function') {
        return processExchangeData(importDetails);
    }
    return [];
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



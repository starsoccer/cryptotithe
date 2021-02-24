import * as papaparse from 'papaparse';
import { IIncome, ImportType, ITrade } from '../types';
import { IImport } from './../types/import';
import { ITransaction } from './../types/transactions';
import processTradesImport from './trades';
import processIncomesImport from './incomes';
import processTransactionsImport from './transactions';

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
            return await processTransactionsImport(importDetails);
        case ImportType.INCOME:
            return await processIncomesImport(importDetails);
        default:
            throw new Error(`Unknown Import Type - ${importDetails.type}`);
    }
}





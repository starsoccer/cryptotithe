import { IImport, IIncome, IncomeImportTypes } from "@types";
import cryptoIDParser from './cryptoID';
import * as crypto from 'crypto';

const parserMapping = {
    [IncomeImportTypes.cryptoID]: cryptoIDParser,
};

export default async function processIncomesImport(importDetails: IImport): Promise<IIncome[]> {
    if (importDetails.location in parserMapping) {
        const parser = parserMapping[importDetails.location];
        return await parser(importDetails);
    } else {
        const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
        const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
        throw new Error(`Unknown Income Type - ${importDetails.location} - ${headersHash}`);
        return [];
    }
}
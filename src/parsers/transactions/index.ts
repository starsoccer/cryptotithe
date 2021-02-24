import { EXCHANGES, IImport, ITransaction } from "@types";
import binanceParser from './binance';
import * as crypto from 'crypto';

const parserMapping = {
    [EXCHANGES.Binance]: binanceParser,
};

export default async function processTransactionsImport(importDetails: IImport): Promise<ITransaction[]> {
    if (importDetails.location in parserMapping) {
        const parser = parserMapping[importDetails.location];
        return await parser(importDetails);
    } else {
        const headers = importDetails.data.substr(0, importDetails.data.indexOf('\n'));
        const headersHash = crypto.createHash('sha256').update(headers).digest('hex');
        throw new Error(`Unknown Exchange - ${importDetails.location} - ${headersHash}`);
        return [];
    }
}
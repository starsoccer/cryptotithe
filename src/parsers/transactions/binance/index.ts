import { getCSVData } from '../../';
import { EXCHANGES, IImport, ITransaction, TransactionImportType } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

interface IBinance {
    Date: string;
    Coin: string;
    Amount: string;
    TransactionFee: number;
    Address: string;
    TXID: string;
    SourceAddress: string;
    PaymentID: string;
    Status: string;
}

export async function processData(importDetails: IImport): Promise<ITransaction[]> {
    const data: IBinance[] = await getCSVData(importDetails.data) as IBinance[];
    const internalFormat: ITransaction[] = [];
    for (const transaction of data) {
        const transactionToAdd: Partial<ITransaction> = {
            amount: parseFloat(transaction.Amount),
            currency: transaction.Coin,
            transactionID: transaction.TXID,
            fee: transaction.TransactionFee,
            date: createDateAsUTC(new Date(transaction.Date)).getTime(),
        };
        switch (importDetails.subtype) {
            case TransactionImportType.DEPOSIT:
                transactionToAdd.fromAddress = transaction.Address;
                transactionToAdd.from = transaction.Address;
                transactionToAdd.to = EXCHANGES.Binance;
                break;
            case TransactionImportType.WITHDRAWL:
                transactionToAdd.toAddress = transaction.Address;
                transactionToAdd.to = transaction.Address;
                transactionToAdd.from = EXCHANGES.Binance;
                break;
            default:
                throw new Error(`Unknown Import Type - ${transaction.Date} - ${importDetails.type}`);
        }
        transactionToAdd.ID = createID(transactionToAdd);
        internalFormat.push(transactionToAdd as ITransaction);
    }
    return internalFormat;
}

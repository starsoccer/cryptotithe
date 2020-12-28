import { getCSVData } from '../..';
import { IImport, IIncome } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum CryptoIDTypes {
    mine = 'Mine',
    receive = 'Receive',
}

interface ICryptoID {
    Transaction: string;
    Block: number;
    'Date/Time': string;
    Type: CryptoIDTypes;
    Amount: string;
    Total: number;
}

export async function processData(importDetails: IImport): Promise<IIncome[]> {
    const cleanedData = importDetails.data.substr(importDetails.data.indexOf('Transaction'));
    const data: ICryptoID[] = await getCSVData(cleanedData) as ICryptoID[];
    const internalFormat: IIncome[] = [];
    for (const income of data) {
        const incomeToAdd: Partial<IIncome> = {
            amount: parseFloat(income.Amount),
            currency: importDetails.currency,
            transactionID: income.Transaction,
            fee: 0,
            date: createDateAsUTC(new Date(income["Date/Time"])).getTime(),
        }
        incomeToAdd.ID = createID(incomeToAdd);

        internalFormat.push(incomeToAdd as IIncome);
    }
    return internalFormat;
}

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
    let cleanedData = importDetails.data.substr(importDetails.data.indexOf('sep=;') + 6);
    cleanedData += "\n";
    const data: ICryptoID[] = await getCSVData(cleanedData) as ICryptoID[];
    const internalFormat: IIncome[] = [];
    for (const income of data) {
        let incomeToAdd: Partial<IIncome> = {
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

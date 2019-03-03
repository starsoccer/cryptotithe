import { IImport, ImportType, ISavedData, ITrade, ITransaction } from '../../types';
import DuplicateTradeCheck from './DuplicateTradeCheck';
import DuplicateTransactionCheck from './DuplicateTransactionCheck';

export default function duplicateCheck(importDetails: IImport, savedData: ISavedData, data: ITrade[] | ITransaction[]) {
    switch (importDetails.type) {
        case ImportType.TRADES:
            return DuplicateTradeCheck(savedData.trades, data as ITrade[]);
        case ImportType.TRANSACTION:
            return DuplicateTransactionCheck(savedData.transactions, data as ITransaction[]);
        default:
            throw new Error(`Unknown Import Type - ${importDetails.type}`);
    }
}

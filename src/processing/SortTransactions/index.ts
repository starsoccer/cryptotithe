import { ITransaction } from '../../types';

export default function sortTransactions(trades: ITransaction[]): ITransaction[] {
    return trades.sort(sortTransactionsByDate);
}

function sortTransactionsByDate(transaction1: ITransaction, transaction2: ITransaction): number {
    return new Date(transaction1.date).getTime() - new Date(transaction2.date).getTime();
}

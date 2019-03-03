import { ITransaction, ITransactionWithDuplicateProbability } from '../../../types';

export default function duplicateTransactionCheck(
    currentTransactions: ITransaction[], newTransactions: ITransaction[],
): ITransactionWithDuplicateProbability[] {
    const duplicateTransactions: ITransactionWithDuplicateProbability[] = [];

    nextTrade: for (const newTransaction of newTransactions) {
        const IDMatchedTrades = currentTransactions.filter((transaction) => newTransaction.ID === transaction.ID);
        if (IDMatchedTrades.length) {
            duplicateTransactions.push({
                ...newTransaction,
                probability: 100,
                duplicate: true,
            });
            continue;
        }
        for (const currentTransaction of currentTransactions) {
            if (newTransaction.to === currentTransaction.to || newTransaction.from === currentTransaction.from) {
                let probability = 0;

                if (
                    newTransaction.toAddress === currentTransaction.toAddress ||
                    newTransaction.fromAddress === currentTransaction.fromAddress
                ) {
                    probability += 30;
                }

                if (newTransaction.date === currentTransaction.date) {
                    if (newTransaction.amount === currentTransaction.amount) {
                        probability += 20;
                    }
                    if (newTransaction.currency === currentTransaction.currency) {
                        probability += 20;
                    }
                    if (newTransaction.fee === currentTransaction.fee) {
                        probability += 30;
                    }
                }
                if (probability > 0) {
                    duplicateTransactions.push({
                        ...newTransaction,
                        probability,
                        duplicate: probability > 50,
                    });
                    continue nextTrade;
                }
            }
        }
        duplicateTransactions.push({
            ...newTransaction,
            probability: 0,
            duplicate: false,
        });
    }
    return duplicateTransactions;
}

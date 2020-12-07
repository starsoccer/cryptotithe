import { IIncome, IIncomeWithDuplicateProbability } from '../../../types';

export default function duplicateIncomeCheck(
    currentIncomes: IIncome[] = [],
    newIncomes: IIncome[],
): IIncomeWithDuplicateProbability[] {
    const duplicateIncome: IIncomeWithDuplicateProbability[] = [];
    nextIncome: for (const newIncome of newIncomes) {
        const IDMatchedIncomes = currentIncomes.filter((income) => newIncome.ID === income.ID);
        if (IDMatchedIncomes.length) {
            duplicateIncome.push({
                ...newIncome,
                probability: 100,
                duplicate: true,
            });
            continue;
        }
        for (const currentIncome of currentIncomes) {
            let probability = 0;

            if (newIncome.date === currentIncome.date) {
                if (newIncome.amount === currentIncome.amount) {
                    probability += 20;
                }
                if (newIncome.currency === currentIncome.currency) {
                    probability += 20;
                }
                if (newIncome.fee === currentIncome.fee) {
                    probability += 30;
                }
            }

            if (probability > 0) {
                duplicateIncome.push({
                    ...newIncome,
                    probability,
                    duplicate: probability > 50,
                });
                continue nextIncome;
            }
        }
        duplicateIncome.push({
            ...newIncome,
            probability: 0,
            duplicate: false,
        });
    }
    return duplicateIncome;
}

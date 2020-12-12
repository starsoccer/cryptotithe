import { IIncomeWithFiatRate, IIncomeWithValue } from "../../types";

const calculateIncomesValue = (incomes: IIncomeWithFiatRate[]) => {
    const newIncomes: IIncomeWithValue[] = [];
    let totalValue = 0;

    for (const income of incomes) {
        const fee = income.fee ?? 0;
        const value = (income.amount - fee) * income.fiatRate;
        totalValue += value;
        newIncomes.push({
            ...income,
            value,
        });
    }

    return {
        totalValue,
        incomes: newIncomes,
    };
};

export default calculateIncomesValue;
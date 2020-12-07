import { IIncome } from "../../types/income";

export default function sortIncomes(trades: IIncome[]): IIncome[] {
    return trades.sort(sortIncomesByDate);
}

function sortIncomesByDate(income1: IIncome, income2: IIncome): number {
    return new Date(income1.date).getTime() - new Date(income2.date).getTime();
}

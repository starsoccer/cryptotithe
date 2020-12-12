import { IIncomeWithValue } from '../../types';

const headers = [
    'Date',
    'Currency',
    'Amount',
    'Fee',
    'Rate',
    'Value',
].join(',');

export default function output(
    incomes: IIncomeWithValue[],
) {
    let csvData: string[] = [
        'Incxomes Export',
    ];
    csvData = csvData.concat(headers);
    csvData = csvData.concat([incomes.map((income) => [
        new Date(income.date),
        income.currency.toUpperCase(),
        income.amount.toString(),
        income.fee.toString(),
        income.fiatRate.toString(),
        income.value.toFixed(2),
    ]).join('\n')]);
    return csvData.join('\n');
};

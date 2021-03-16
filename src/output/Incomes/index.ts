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
    fiatCurrency: string,
) {
    let csvData: string[] = [
        'Incxomes Export',
    ];

    let totalValue = 0;
    

    csvData = csvData.concat(headers);
    csvData = csvData.concat([incomes.map((income) => {
        const value = income.value.toFixed(2);
        totalValue += parseFloat(value);
        return [
            new Date(income.date),
            income.currency.toUpperCase(),
            income.amount.toString(),
            income.fee?.toString(),
            `${income.fiatRate.toString()} ${fiatCurrency}`,
            `${value} ${fiatCurrency}`,
        ];
    }).join('\n')]);

    csvData = csvData.concat([
        '','','','','',
        `${totalValue.toFixed(2)} ${fiatCurrency}`
    ].join(','));
    return csvData.join('\n');
}

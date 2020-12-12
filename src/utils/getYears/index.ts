import { IIncome, ITrade } from '../../types';

export default function getYears(items: ITrade[] | IIncome[]) {
    const years: string[] = [];
    items.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (years.indexOf(year.toString()) === -1) {
            years.push(year.toString());
        }
    });
    return years;
}

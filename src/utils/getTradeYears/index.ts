import { ITrade } from './../../types';

export default function getTradeYears(trades: ITrade[]) {
    const years: string[] = [];
    trades.forEach((trade) => {
        const year = new Date(trade.date).getFullYear();
        if (years.indexOf(year.toString()) === -1) {
            years.push(year.toString());
        }
    });
    return years;
}

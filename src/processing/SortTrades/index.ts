import { ITrade } from '../../types';

export default function sortTrades(trades: ITrade[]): ITrade[] {
    return trades.sort(sortTradesByDate);
}

function sortTradesByDate(trade1: ITrade, trade2: ITrade): number {
    return trade1.date - trade2.date;
}

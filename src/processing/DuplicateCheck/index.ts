import { ITrade, ITradeWithDuplicateProbability } from '../../types';

export default function duplicateCheck(currentTrades: ITrade[], newTrades: ITrade[]): ITradeWithDuplicateProbability[] {
    const duplicateTrades: ITradeWithDuplicateProbability[] = [];
    for (const newTrade of newTrades) {
        for (const currentTrade of currentTrades) {
            if (newTrade.exchange === currentTrade.exchange) {
                let probability = 0;
                if (newTrade.id === currentTrade.id) {
                    probability = 100;
                } else if (newTrade.date === currentTrade.date) {
                    if (
                        newTrade.boughtCurreny === currentTrade.boughtCurreny ||
                        newTrade.soldCurrency === currentTrade.soldCurrency
                    ) {
                        probability += 20;
                    }
                    if (newTrade.amountSold === currentTrade.amountSold) {
                        probability += 30;
                    }
                    if (newTrade.rate === currentTrade.rate) {
                        probability += 50;
                    }
                }
                if (probability > 0) {
                    duplicateTrades.push({
                        ...newTrade,
                        probability,
                    });
                }
            }
        }
    }
    return duplicateTrades;
}

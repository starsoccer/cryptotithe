import { ITrade, ITradeWithDuplicateProbability } from '../../types';

export default function duplicateCheck(currentTrades: ITrade[], newTrades: ITrade[]): ITradeWithDuplicateProbability[] {
    const duplicateTrades: ITradeWithDuplicateProbability[] = [];

    nextTrade: for (const newTrade of newTrades) {
        const IDMatchedTrades = currentTrades.filter((trade) =>
            newTrade.ID === trade.ID || newTrade.exchangeID === trade.exchangeID,
        );
        if (IDMatchedTrades.length) {
            duplicateTrades.push({
                ...newTrade,
                probability: 100,
                duplicate: true,
            });
            continue;
        }
        for (const currentTrade of currentTrades) {
            if (newTrade.exchange === currentTrade.exchange) {
                let probability = 0;
                if (newTrade.date === currentTrade.date) {
                    if (
                        newTrade.boughtCurrency === currentTrade.boughtCurrency ||
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
                        duplicate: probability > 50,
                    });
                    continue nextTrade;
                }
            }
        }
        duplicateTrades.push({
            ...newTrade,
            probability: 0,
            duplicate: false,
        });
    }
    return duplicateTrades;
}

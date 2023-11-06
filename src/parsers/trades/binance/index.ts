import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum BinanceOrderType {
    SELL = 'SELL',
    BUY = 'BUY',
}

interface IBinance {
    'Date(UTC)': string;
    Pair: string;
    Side: BinanceOrderType;
    Price: string;
    Amount: string;
    Executed: string;
    Fee: string;
}

function getPairs(executedAmount: string, amount: string) {
    const executedCurrency = executedAmount.replace(/[0-9,.]/g, '');
    const amountCurrent = amount.replace(/[0-9,.]/g, '');
    return [executedCurrency, amountCurrent];
}

function getFeeCoin (fee: string, pair: string[]) {
    if (fee.includes(pair[0])) {
        return pair[0]
    }

    if (fee.includes(pair[1])) {
        return pair[1]
    }

    return 'Unknown'
} 

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IBinance[] = await getCSVData(importDetails.data) as IBinance[];
    const internalFormat: ITrade[] = [];

    for (const trade of data) {
        const pair: string[] = getPairs(trade.Executed, trade.Amount);
        const tradeFeeCoin = getFeeCoin(trade.Fee, pair);
        const tradeToAdd: IPartialTrade = {};
        switch (trade.Side) {
            case BinanceOrderType.BUY:
                tradeToAdd.boughtCurrency = pair[0].toUpperCase();
                tradeToAdd.soldCurrency = pair[1].toUpperCase();
                tradeToAdd.date = createDateAsUTC(new Date(trade['Date(UTC)'])).getTime();
                tradeToAdd.exchange = EXCHANGES.Binance;
                if (pair[1].toUpperCase() === tradeFeeCoin) {
                    tradeToAdd.amountSold = parseFloat(trade.Executed) + parseFloat(trade.Fee);
                    tradeToAdd.rate = tradeToAdd.amountSold / parseFloat(trade.Amount);
                } else {
                    tradeToAdd.amountSold = parseFloat(trade.Executed);
                    tradeToAdd.rate = parseFloat(trade.Executed) / (parseFloat(trade.Amount) + parseFloat(trade.Fee));
                }
                break;
            case BinanceOrderType.SELL:
                tradeToAdd.soldCurrency = pair[0].toUpperCase();
                tradeToAdd.boughtCurrency = pair[1].toUpperCase();
                tradeToAdd.date = createDateAsUTC(new Date(trade['Date(UTC)'])).getTime();
                tradeToAdd.exchange = EXCHANGES.Binance;
                if (pair[1].toUpperCase() === tradeFeeCoin) {
                    tradeToAdd.amountSold = parseFloat(trade.Amount);
                    tradeToAdd.rate = parseFloat(trade.Amount) / (parseFloat(trade.Executed) - parseFloat(trade.Fee));
                } else {
                    tradeToAdd.amountSold = parseFloat(trade.Amount) + parseFloat(trade.Fee);
                    tradeToAdd.rate = tradeToAdd.amountSold / parseFloat(trade.Executed);
                }
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Date(UTC)']);
        }
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        tradeToAdd.transactionFeeCurrency = tradeToAdd.boughtCurrency;
        tradeToAdd.transactionFee = 0;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

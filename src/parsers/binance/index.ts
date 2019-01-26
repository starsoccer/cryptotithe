import { getCSVData } from '../';
import { EXCHANGES, IPartialTrade, ITrade } from '../../types';
import { createDateAsUTC, createTradeID } from '../utils';

enum BinanceOrderType {
    SELL = 'SELL',
    BUY = 'BUY',
}

interface IBinance {
    'Date(UTC)': string;
    Market: string;
    Type: BinanceOrderType;
    Price: string;
    Amount: string;
    Total: string;
    Fee: string;
    'Fee Coin': string;
}

function getPairs(market: string) {
    const pairs = [];
    if (market.length === 6) {
        pairs.push(market.substr(0, 3));
        pairs.push(market.substr(3, 3));
    } else {
        pairs.push(market.substr(0, 4));
        pairs.push(market.substr(4, 3));
    }
    return pairs;
}

export async function processData(fileData: string): Promise<ITrade[]> {
    const data: IBinance[] = await getCSVData(fileData) as IBinance[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pair: string[] = getPairs(trade.Market);
        const tradeToAdd: IPartialTrade = {};
        switch (trade.Type) {
            case BinanceOrderType.BUY:
                tradeToAdd.boughtCurrency = pair[0].toUpperCase();
                tradeToAdd.soldCurrency = pair[1].toUpperCase();
                tradeToAdd.date = createDateAsUTC(new Date(trade['Date(UTC)'])).getTime();
                tradeToAdd.exchange = EXCHANGES.Binance;
                if (pair[1].toUpperCase() === trade['Fee Coin']) {
                    tradeToAdd.amountSold = parseFloat(trade.Total) + parseFloat(trade.Fee);
                    tradeToAdd.rate = tradeToAdd.amountSold / parseFloat(trade.Amount);
                } else {
                    tradeToAdd.amountSold = parseFloat(trade.Total);
                    tradeToAdd.rate = parseFloat(trade.Total) / (parseFloat(trade.Amount) + parseFloat(trade.Fee));
                }
                break;
            case BinanceOrderType.SELL:
                tradeToAdd.soldCurrency = pair[0].toUpperCase();
                tradeToAdd.boughtCurrency = pair[1].toUpperCase();
                tradeToAdd.date = createDateAsUTC(new Date(trade['Date(UTC)'])).getTime();
                tradeToAdd.exchange = EXCHANGES.Binance;
                if (pair[1].toUpperCase() === trade['Fee Coin']) {
                    tradeToAdd.amountSold = parseFloat(trade.Amount);
                    tradeToAdd.rate = parseFloat(trade.Amount) / (parseFloat(trade.Total) - parseFloat(trade.Fee));
                } else {
                    tradeToAdd.amountSold = parseFloat(trade.Amount) + parseFloat(trade.Fee);
                    tradeToAdd.rate = tradeToAdd.amountSold / parseFloat(trade.Total);
                }
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Date(UTC)']);
        }
        tradeToAdd.ID = createTradeID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        tradeToAdd.transactionFeeCurrency = tradeToAdd.boughtCurrency;
        tradeToAdd.transactionFee = 0;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

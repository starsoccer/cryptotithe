import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum TradeOgreOrderType {
    SELL = 'SELL',
    BUY = 'BUY',
}

interface ITradeOgre {
    Type: string;
    Exchange: string;
    Date: string;
    Amount: string;
    Price: string;
    Fee: string;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: ITradeOgre[] = await getCSVData(importDetails.data) as ITradeOgre[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(trade.Date)).getTime(),
            exchange : EXCHANGES.TradeOgre,
        };
        if (trade.Type === TradeOgreOrderType.BUY) {
            [tradeToAdd.soldCurrency, tradeToAdd.boughtCurrency] = trade.Exchange.split('-');
            tradeToAdd.amountSold = parseFloat(trade.Amount) * parseFloat(trade.Price);
            tradeToAdd.rate = parseFloat(trade.Price);
            tradeToAdd.tradeFeeCurrency = tradeToAdd.soldCurrency;
        } else if (trade.Type === TradeOgreOrderType.SELL) {
            [tradeToAdd.boughtCurrency, tradeToAdd.soldCurrency] = trade.Exchange.split('-');
            tradeToAdd.amountSold = parseFloat(trade.Amount);
            tradeToAdd.rate = 1 / parseFloat(trade.Price);
            tradeToAdd.tradeFeeCurrency = tradeToAdd.boughtCurrency;
        } else {
            console.error(`Error parsing ${tradeToAdd.exchange} trade.
    Unknown type ${trade.Type}`);
            continue;
        }
        tradeToAdd.tradeFee = parseFloat(trade.Fee);
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

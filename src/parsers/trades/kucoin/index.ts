import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum KuCoinTradeDirection {
    SELL = 'SELL',
    BUY = 'BUY',
}

interface IKuCoin {
    user_id: string;
    trade_id: string;
    symbol: string;
    order_type: string;
    deal_price: string;
    amount: string;
    direction: string;
    funds: string;
    fee_currency: string;
    fee: string;
    created_at: string;
    created_date: string;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IKuCoin[] = await getCSVData(importDetails.data) as IKuCoin[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(parseInt(trade.created_at)*1000)).getTime(),
            exchange : EXCHANGES.KuCoin,
            exchangeID : trade.trade_id,
        };
        if (trade.direction.toUpperCase() === KuCoinTradeDirection.BUY) {
            [tradeToAdd.boughtCurrency, tradeToAdd.soldCurrency] = trade.symbol.split('-');
            tradeToAdd.amountSold = parseFloat(trade.funds);
            tradeToAdd.rate = parseFloat(trade.deal_price);
        } else if (trade.direction.toUpperCase() === KuCoinTradeDirection.SELL) {
            [tradeToAdd.soldCurrency, tradeToAdd.boughtCurrency] = trade.symbol.split('-');
            tradeToAdd.amountSold = parseFloat(trade.amount);
            tradeToAdd.rate = 1 / parseFloat(trade.deal_price);
        } else {
            console.error(`Error parsing ${tradeToAdd.exchange} trade.
Unknown direction ${trade.direction}`);
            continue;
        }
        tradeToAdd.tradeFee = parseFloat(trade.fee);
        tradeToAdd.tradeFeeCurrency = trade.fee_currency;
        tradeToAdd.ID = createID(tradeToAdd);
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

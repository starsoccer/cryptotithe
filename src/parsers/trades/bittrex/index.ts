import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum BittrexOrderType {
    LIMIT_SELL = 'LIMIT_SELL',
    LIMIT_BUY = 'LIMIT_BUY',
}

interface IBittrex {
    OrderUuid: string;
    Exchange: string;
    Type: BittrexOrderType;
    Quantity: string;
    Limit: string;
    CommissionPaid: string;
    Price: string;
    Opened: string;
    Closed: string;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IBittrex[] = await getCSVData(importDetails.data) as IBittrex[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pair: string[] = trade.Exchange.split('-');
        const partialTrade: IPartialTrade = {
            date: createDateAsUTC(new Date(trade.Closed)).getTime(),
            exchangeID: trade.OrderUuid,
            exchange: EXCHANGES.Bittrex,
            transactionFee: 0,
        };
        switch (trade.Type) {
            case BittrexOrderType.LIMIT_BUY:
                partialTrade.boughtCurrency = pair[1].toUpperCase();
                partialTrade.soldCurrency = pair[0].toUpperCase();
                partialTrade.amountSold = parseFloat(trade.Quantity) * parseFloat(trade.Limit);
                partialTrade.rate = parseFloat((parseFloat(trade.Price) / parseFloat(trade.Quantity)).toFixed(8));
                break;
            case BittrexOrderType.LIMIT_SELL:
                partialTrade.boughtCurrency = pair[0].toUpperCase();
                partialTrade.soldCurrency = pair[1].toUpperCase();
                partialTrade.amountSold = parseFloat(trade.Quantity);
                partialTrade.rate = parseFloat((parseFloat(trade.Quantity) / parseFloat(trade.Price)).toFixed(8));
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade.OrderUuid);
        }
        partialTrade.ID = createID(partialTrade);
        partialTrade.transactionFeeCurrency = partialTrade.boughtCurrency;
        internalFormat.push(partialTrade as ITrade);
    }
    return internalFormat;
}

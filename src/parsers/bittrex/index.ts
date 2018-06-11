import { getCSVData } from '../';
import { EXCHANGES, ITrade } from '../../types';

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

export async function processData(filePath: string): Promise<ITrade[]> {
    const data: IBittrex[] = await getCSVData(filePath) as IBittrex[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pair: string[] = trade.Exchange.split('-');
        switch (trade.Type) {
            case BittrexOrderType.LIMIT_BUY:
                internalFormat.push({
                    boughtCurreny: pair[1],
                    soldCurrency: pair[0],
                    amountSold: parseFloat(trade.Price) + parseFloat(trade.CommissionPaid),
                    rate: parseFloat(trade.Price) / parseFloat(trade.Quantity),
                    date: new Date(trade.Closed).getTime(),
                    id: trade.OrderUuid,
                    exchange: EXCHANGES.BITTREX,
                });
                break;
            case BittrexOrderType.LIMIT_SELL:
                internalFormat.push({
                    boughtCurreny: pair[0],
                    soldCurrency: pair[1],
                    amountSold: parseFloat(trade.Quantity),
                    rate: parseFloat(trade.Quantity) / parseFloat(trade.Price),
                    date: new Date(trade.Closed).getTime(),
                    id: trade.OrderUuid,
                    exchange: EXCHANGES.BITTREX,
                });
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade.OrderUuid);
        }
    }
    return internalFormat;
}
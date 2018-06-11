import { getCSVData } from '../';
import { EXCHANGES, ITrade } from '../../types';

enum PoloniexOrderType {
    BUY = 'BUY',
    SELL = 'SELL',
}

interface IPoloniex {
    Date: string;
    Market: string;
    Category: string;
    Type: PoloniexOrderType;
    Price: string;
    Amount: string;
    Total: string;
    Fee: string;
    'Order Number': string;
    'Base Total Less Fee': string;
    'Quote Total Less Fee': string;
}

export async function processData(filePath: string): Promise<ITrade[]> {
    const data: IPoloniex[] = await getCSVData(filePath) as IPoloniex[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pair: string[] = trade.Market.split('/');
        switch (trade.Type) {
            case PoloniexOrderType.BUY:
                internalFormat.push({
                    boughtCurreny: pair[0],
                    soldCurrency: pair[1],
                    amountSold: Math.abs(parseFloat(trade['Base Total Less Fee'])),
                    rate: parseFloat(trade.Price),
                    date: new Date(trade.Date).getTime(),
                    id: trade['Order Number'],
                    exchange: EXCHANGES.POLONIEX,
                });
                break;
            case PoloniexOrderType.SELL:
                internalFormat.push({
                    boughtCurreny: pair[1],
                    soldCurrency: pair[0],
                    amountSold: Math.abs(parseFloat(trade['Quote Total Less Fee'])),
                    rate: parseFloat(trade.Amount) * parseFloat(trade.Price),
                    date: new Date(trade.Date).getTime(),
                    id: trade['Order Number'],
                    exchange: EXCHANGES.POLONIEX,
                });
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Order Number']);
        }
    }
    return internalFormat;
}

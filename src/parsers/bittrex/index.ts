import path = require('path'); // path.resolve(__dirname, "settings.json"
import { getCSVData } from '../';
import { calculateGains } from '../../processing/CalculateGains';
import { ICurrencyHolding, IHoldings, ITradeWithGains, ITradeWithUSDRate, METHOD } from '../../types';
import { getUSDRate } from '../getUSDRate';

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

export async function processData(filePath: string): Promise<ITradeWithUSDRate[]> {
    const data: IBittrex[] = await getCSVData(filePath) as IBittrex[];
    const internalFormat: ITradeWithUSDRate[] = [];
    for (const trade of data) {
        const pair: string[] = trade.Exchange.split('-');
        switch (trade.Type) {
            case BittrexOrderType.LIMIT_BUY:
                internalFormat.push({
                    boughtCurreny: pair[1],
                    soldCurrency: pair[0],
                    amountSold: parseFloat(trade.Price) + parseFloat(trade.CommissionPaid),
                    rate: parseFloat(trade.Price) / parseFloat(trade.Quantity),
                    date: new Date(trade.Closed),
                    USDRate: (pair[0] === 'BTC' ? await getUSDRate(new Date(trade.Closed)) : 0),
                });
                break;
            case BittrexOrderType.LIMIT_SELL:
                internalFormat.push({
                    boughtCurreny: pair[0],
                    soldCurrency: pair[1],
                    amountSold: parseFloat(trade.Quantity),
                    rate: parseFloat(trade.Quantity) / parseFloat(trade.Price),
                    date: new Date(trade.Closed),
                    USDRate: await getUSDRate(new Date(trade.Closed)) *
                        parseFloat(trade.Price) / parseFloat(trade.Quantity),
                });
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade.OrderUuid);
        }
    }
    return internalFormat;
}

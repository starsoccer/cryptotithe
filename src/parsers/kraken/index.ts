import { getCSVData } from '../';
import { EXCHANGES, ITradeWithUSDRate } from '../../types';
import { getUSDRate } from '../getUSDRate';

enum KrakenType {
    BUY = 'buy',
    SELL = 'sell',
}

enum KrakenOrderType {
    LIMIT = 'limit',
    MARKET = 'market',
}

interface IKraken {
    txid: string;
    ordertxid: string;
    pair: string;
    time: string;
    type: string;
    ordertype: KrakenOrderType;
    price: string;
    cost: string;
    fee: string;
    vol: string;
    margin: string;
    misc: string;
    ledgers: string;
}

export async function processData(filePath: string): Promise<ITradeWithUSDRate[]> {
    const data: IKraken[] = await getCSVData(filePath) as IKraken[];
    const internalFormat: ITradeWithUSDRate[] = [];
    for (const trade of data) {
        const pairs: string[] = [
            trade.pair.substr(0, 3),
            trade.pair.substr(trade.pair.length - 3),
        ];
        switch (trade.type) {
            case KrakenType.BUY:
                let USDTrade: boolean = false;
                for (const pair in pairs) {
                    if (pair === 'USD') {
                        USDTrade = true;
                    }
                }
                if (USDTrade) {
                    // do something
                }

                internalFormat.push({
                    boughtCurreny: pairs[0],
                    soldCurrency: pairs[1],
                    amountSold: parseFloat(trade.cost),
                    rate: parseFloat(trade.price),
                    date: new Date(trade.time).getTime(),
                    USDRate: await getUSDRate(new Date(trade.time)),
                    id: trade.txid,
                    exchange: EXCHANGES.KRAKEN,
                });
                break;
            case KrakenType.SELL:
                internalFormat.push({
                    boughtCurreny: pairs[1],
                    soldCurrency: pairs[0],
                    amountSold: parseFloat(trade.vol),
                    rate: parseFloat(trade.price),
                    date: new Date(trade.time).getTime(),
                    USDRate: await getUSDRate(new Date(trade.time)) * parseFloat(trade.price) / parseFloat(trade.vol),
                    id: trade.txid,
                    exchange: EXCHANGES.KRAKEN,
                });
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Order Number']);
        }
    }
    return internalFormat;
}

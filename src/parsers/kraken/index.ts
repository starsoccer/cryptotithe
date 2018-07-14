import { getCSVData } from '../';
import { EXCHANGES, ITrade } from '../../types';
import { createDateAsUTC } from '../utils';

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
// maybe change it to https://api.kraken.com/0/public/Assets api call
const KRAKEN_TO_NORMAL_CURRENCY = {
    XXBT: 'BTC',
    XBT: 'BTC',
    XXMR: 'XMR',
    XXLM: 'XLM',
    XETC: 'ETC',
    XETH: 'ETH',
    ZUSD: 'USD',
    XZEC: 'ZEC',
    XDAO: 'DAO',
    XICN: 'ICN',
    XLTC: 'LTC',
    XMLN: 'MLN',
    XNMC: 'NMC',
    XREP: 'REP',
    XXDG: 'DOGE',
    XXRP: 'XRP',
    XXVN: 'XVN',
    ZCAD: 'CAD',
    ZEUR: 'EUR',
    ZGBP: 'GBP',
    ZJPY: 'JPY',
    ZKRW: 'KRW',
};

function getRealTradedPairs(market: string) {
    const pairs = [];
    switch (market.length) {
        case 6:
            pairs.push(market.substr(0, 3));
            pairs.push(market.substr(3));
            break;
        case 8:
            pairs.push(market.substr(0, 4));
            pairs.push(market.substr(4));
            break;
        default:
            throw new Error('Unknwon Market Length');
    }

    return pairs.map((pair) => (pair in KRAKEN_TO_NORMAL_CURRENCY ? KRAKEN_TO_NORMAL_CURRENCY[pair] : pair));
}

export async function processData(filePath: string): Promise<ITrade[]> {
    const data: IKraken[] = await getCSVData(filePath) as IKraken[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pairs: string[] = getRealTradedPairs(trade.pair);
        switch (trade.type) {
            case KrakenType.BUY:
                internalFormat.push({
                    boughtCurrency: pairs[0].toUpperCase(),
                    soldCurrency: pairs[1].toUpperCase(),
                    amountSold: parseFloat(trade.cost),
                    rate: (parseFloat(trade.cost) + parseFloat(trade.fee)) / (parseFloat(trade.vol)),
                    date: createDateAsUTC(new Date(trade.time)).getTime(),
                    id: trade.txid,
                    exchange: EXCHANGES.KRAKEN,
                });
                break;
            case KrakenType.SELL:
                internalFormat.push({
                    boughtCurrency: pairs[1].toUpperCase(),
                    soldCurrency: pairs[0].toUpperCase(),
                    amountSold: parseFloat(trade.vol),
                    rate: parseFloat(trade.vol) / (parseFloat(trade.cost) - parseFloat(trade.fee)),
                    date: createDateAsUTC(new Date(trade.time)).getTime(),
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

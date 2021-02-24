import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';
import axios from 'axios';

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

function convertCurrencyToNormalCurrency(currency: string) {
    return currency in KRAKEN_TO_NORMAL_CURRENCY ? KRAKEN_TO_NORMAL_CURRENCY[currency] : currency;
}

async function getMaretPairs() {
    const response = await axios('https://api.kraken.com/0/public/AssetPairs');
    if (response.status === 200) {
        if ('result' in response.data && 'error' in response.data && response.data.error.length === 0) {
            const marketPairs = response.data.result;
            const markets = Object.keys(marketPairs);
            for (const market of markets) {
                marketPairs[market] = {
                    ...marketPairs[market],
                    base: convertCurrencyToNormalCurrency(marketPairs[market].base),
                    quote: convertCurrencyToNormalCurrency(marketPairs[market].quote),
                }
            }
            return marketPairs;
        }
    }
}

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
            throw new Error('Unknown Market Length');
    }

    return pairs.map((pair) => (pair in KRAKEN_TO_NORMAL_CURRENCY ? KRAKEN_TO_NORMAL_CURRENCY[pair] : pair));
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IKraken[] = await getCSVData(importDetails.data) as IKraken[];
    const marketPairs = await getMaretPairs();
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        let pairs = [];
        if (trade.pair in marketPairs) {
            pairs = [
                marketPairs[trade.pair].base,
                marketPairs[trade.pair].quote,
            ];
        } else {
            pairs = getRealTradedPairs(trade.pair);
        }
        const partialTrade: IPartialTrade = {
            exchange: EXCHANGES.Kraken,
            exchangeID: trade.txid,
            date: createDateAsUTC(new Date(trade.time)).getTime(),
            transactionFee: 0,
        };
        switch (trade.type) {
            case KrakenType.BUY:
                partialTrade.boughtCurrency = pairs[0].toUpperCase();
                partialTrade.soldCurrency = pairs[1].toUpperCase();
                partialTrade.amountSold = parseFloat(trade.cost);
                partialTrade.rate = (parseFloat(trade.cost) + parseFloat(trade.fee)) / (parseFloat(trade.vol));
                break;
            case KrakenType.SELL:
                partialTrade.boughtCurrency = pairs[1].toUpperCase();
                partialTrade.soldCurrency = pairs[0].toUpperCase();
                partialTrade.amountSold = parseFloat(trade.vol);
                partialTrade.rate = parseFloat(trade.vol) / (parseFloat(trade.cost) - parseFloat(trade.fee));
                break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Order Number']);
        }
        partialTrade.transactionFeeCurrency = partialTrade.boughtCurrency;
        partialTrade.ID = createID(partialTrade);
        internalFormat.push(partialTrade as ITrade);
    }
    return internalFormat;
}

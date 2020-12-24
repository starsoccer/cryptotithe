import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

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

function getPairs(market: string, currentFeeCoin: string, feeCoins: string[]) {
    const pairs = [];
    // if length is 6 assume is an even 3 split
    if (market.length === 6) {
        pairs.push(market.substr(0, 3));
        pairs.push(market.substr(3, 3));
    } else {
        let feeCurrency = currentFeeCoin;
        let feeCoinLocation = market.indexOf(feeCurrency);

        // if fee coin isnt found
        if (feeCoinLocation === -1) {
            let found = false;

            for (const feeCoin of feeCoins) {
                if (market.includes(feeCoin)) {
                    found = true;
                    feeCurrency = feeCoin;
                    feeCoinLocation = market.indexOf(feeCurrency);
                    break;
                }
            }

            // uf none found fallback to old method
            if (!found) {
                pairs.push(market.substr(0, 4));
                pairs.push(market.substr(4, 3));
                return pairs;
            }
        }

        // if fee coin is first to appear split at end
        if (feeCoinLocation === 0) {
            pairs.push(market.substr(0, feeCurrency.length));
            pairs.push(market.substr(feeCurrency.length));
        } else {
            pairs.push(market.substr(0, feeCoinLocation));
            pairs.push(market.substr(feeCoinLocation));
        }
    }
    return pairs;
}

export async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IBinance[] = await getCSVData(importDetails.data) as IBinance[];
    const internalFormat: ITrade[] = [];
    const feeCoins = data.map((trade) => trade['Fee Coin']);
    for (const trade of data) {
        const pair: string[] = getPairs(trade.Market, trade['Fee Coin'], feeCoins);
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
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        tradeToAdd.transactionFeeCurrency = tradeToAdd.boughtCurrency;
        tradeToAdd.transactionFee = 0;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

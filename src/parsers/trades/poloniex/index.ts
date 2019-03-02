import { getCSVData } from '../../';
import { EXCHANGES, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum PoloniexOrderType {
    BUY = 'Buy',
    SELL = 'Sell',
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

function parseNumber(amount: string): number {
    return Math.abs(parseFloat(amount));
}

function garbageTrade(trade: IPoloniex) {
    return parseNumber(trade['Quote Total Less Fee']) === 0 || parseNumber(trade['Base Total Less Fee']) === 0;
}

export async function processData(fileData: string): Promise<ITrade[]> {
    const data: IPoloniex[] = await getCSVData(fileData) as IPoloniex[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const pair: string[] = trade.Market.split('/');
        // some trades have 0 cost/value so skip those
        if (garbageTrade(trade))  {
            // change to something to warn users ('Garbage Trade Skipped - ' + trade['Order Number']);
            continue;
        }
        const partialTrade: IPartialTrade = {
            date: createDateAsUTC(new Date(trade.Date)).getTime(),
            exchangeID: trade['Order Number'],
            exchange: EXCHANGES.Poloniex,
            transactionFee: 0,
        };
        switch (trade.Type) {
            case PoloniexOrderType.BUY:
                partialTrade.boughtCurrency = pair[0].toUpperCase();
                partialTrade.soldCurrency = pair[1].toUpperCase();
                partialTrade.amountSold = parseNumber(trade['Base Total Less Fee']);
                partialTrade.rate =
                    parseNumber(trade['Base Total Less Fee']) / parseNumber(trade['Quote Total Less Fee']);
                break;
            case PoloniexOrderType.SELL:
                    partialTrade.boughtCurrency = pair[1].toUpperCase();
                    partialTrade.soldCurrency = pair[0].toUpperCase();
                    partialTrade.amountSold = parseNumber(trade['Quote Total Less Fee']);
                    partialTrade.rate =
                        parseNumber(trade['Quote Total Less Fee']) / parseNumber(trade['Base Total Less Fee']);
                    break;
            default:
                throw new Error('Unknown Order Type - ' + trade['Order Number']);
        }
        partialTrade.ID = createID(partialTrade);
        partialTrade.transactionFeeCurrency = partialTrade.boughtCurrency;
        internalFormat.push(partialTrade as ITrade);
    }
    return internalFormat;
}

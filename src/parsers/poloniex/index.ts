import { getCSVData } from '../';
import { EXCHANGES, ITrade } from '../../types';
import { createDateAsUTC } from '../utils';

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
        if(garbageTrade(trade))  {
            console.log('Garbage Trade Skipped - ' + trade['Order Number']);
            continue;
        }
        switch (trade.Type) {
            case PoloniexOrderType.BUY:
                internalFormat.push({
                    boughtCurrency: pair[0].toUpperCase(),
                    soldCurrency: pair[1].toUpperCase(),
                    amountSold: parseNumber(trade['Base Total Less Fee']),
                    rate: parseNumber(trade['Base Total Less Fee']) / parseNumber(trade['Quote Total Less Fee']),
                    date: createDateAsUTC(new Date(trade.Date)).getTime(),
                    id: trade['Order Number'],
                    exchange: EXCHANGES.POLONIEX,
                });
                break;
            case PoloniexOrderType.SELL:
                internalFormat.push({
                    boughtCurrency: pair[1].toUpperCase(),
                    soldCurrency: pair[0].toUpperCase(),
                    amountSold: parseNumber(trade['Quote Total Less Fee']),
                    rate: parseNumber(trade['Quote Total Less Fee']) / parseNumber(trade['Base Total Less Fee']),
                    date: createDateAsUTC(new Date(trade.Date)).getTime(),
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

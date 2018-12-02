import { getCSVData } from '../';
import { EXCHANGES, IPartialTrade, ITrade } from '../../types';
import { createDateAsUTC, createTradeID } from '../utils';

enum GeminiOrderType {
    Sell = 'Sell',
    Buy = 'Buy',
    Credit = 'Credit',
    Debit = 'Debit',
}

interface IGemini {
    Date: string;
    Time: string;
    Type: GeminiOrderType;
    Symbol: string;
    Specification: string;
    Liquidity: string;
    'Trading Fee': string;
    'USD Amount': string;
    'Trading Fee (USD)': string;
    'USD Balance': string;
    'BTC Amount': string;
    'Trading Fee (BTC)': string;
    'BTC Balance': string;
    'ETH Amount': string;
    'Trading Fee (ETH)': string;
    'ETH Balance': string;
    'ZEC Amount': string;
    'Trading Fee (ZEC)': string;
    'ZEC Balance': string;
    'Trade ID': string;
    'Order ID': string;
    'Order Date': string;
    'Order Time': string;
    'Client Order ID': string;
    'API Session': string;
    'Tx Hash': string;
    'Deposit Tx Output': string;
    'Withdrawal Destination': string;
    'Withdrawal Tx Output': string;
}
interface ITraded {
    bought: string;
    sold: string;
}

function getCurrenciesTraded(trade: IGemini): ITraded {
    const keys: string[] = Object.keys(trade);
    const currencies: ITraded = {
        bought: '',
        sold: '',
    };
    for (const key of keys) {
        if (key.indexOf(' Amount') !== -1 && trade[key] !== undefined && trade[key] !== '') {
            if (trade[key].substring(0, 1) === '-' || trade[key].substring(0, 1) === '(') {
                currencies.sold = key.substring(0, 3);
            } else {
                currencies.bought = key.substring(0, 3);
            }
        }
    }
    return currencies;
}

function parseNumber(amount: string): number {
    if (!amount || amount === null || amount === '') {
        return 0;
    }
    const amountSold = amount.replace(/[($-,)]/g, '');
    return parseFloat(amountSold.split(' ')[0]);
}

export async function processData(fileData: string): Promise<ITrade[]> {
    const data: IGemini[] = await getCSVData(fileData) as IGemini[];
    const internalFormat: ITrade[] = [];
    for (let i = 1; i < data.length - 1; i++) {
        const trade = data[i];
        if (trade.Symbol.length > 3) {
            const pair: ITraded = getCurrenciesTraded(trade);
            switch (trade.Type) {
                case GeminiOrderType.Buy:
                case GeminiOrderType.Sell:
                    const amountSold = parseNumber(trade[`${pair.sold} Amount`]);
                    const amountSoldFee = parseNumber(trade[`Trading Fee (${pair.sold})`]);
                    const amountBought = parseNumber(trade[`${pair.bought} Amount`]);
                    const amountBoughtFee = parseNumber(trade[`Trading Fee (${pair.bought})`]);
                    const partialTrade: IPartialTrade = {
                        boughtCurrency: pair.bought.toUpperCase(),
                        soldCurrency: pair.sold.toUpperCase(),
                        amountSold: amountSold + amountSoldFee,
                        rate: (amountSold + amountSoldFee) / (amountBought - amountBoughtFee),
                        date: createDateAsUTC(new Date(`${trade['Order Date']} ${trade['Order Time']}`)).getTime(),
                        exchangeID: trade['Trade ID'],
                        exchange: EXCHANGES.GEMINI,
                        transactionFeeCurrency: pair.bought.toUpperCase(),
                        transactionFee: 0,
                    };
                    partialTrade.ID = createTradeID(partialTrade);
                    internalFormat.push(partialTrade as ITrade);
                    break;
                case GeminiOrderType.Credit:
                case GeminiOrderType.Debit:
                    throw new Error('Credit/Debit - Skipping');
                default:
                    throw new Error(`Unknown Order Type - ${trade['Order ID']} - ${trade['Trade ID']}`);
            }
        }
    }
    return internalFormat;
}

import { getCSVData } from '../../';
import { EXCHANGES, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum GeminiOrderType {
    Sell = 'Sell',
    Buy = 'Buy',
    Credit = 'Credit',
    Debit = 'Debit',
}
interface IGemini {
    Date: string;
    'Time (UTC)': string;
    Type: GeminiOrderType;
    Symbol: string;
    Specification: string;
    'Liquidity Indicator': string;
    'Trading Fee Rate (bps)': string;
    'USD Amount USD': string;
    'Trading Fee (USD) USD': string;
    'USD Balance USD': string;
    'BTC Amount BTC': string;
    'Trading Fee (BTC) BTC': string;
    'BTC Balance BTC': string;
    'ETH Amount ETH': string;
    'Trading Fee (ETH) ETH': string;
    'ETH Balance ETH': string;
    'ZEC Amount ZEC': string;
    'Trading Fee (ZEC) ZEC': string;
    'ZEC Balance ZEC': string;
    'BCH Amount BCH': string;
    'Trading Fee (BCH) BCH': string;
    'BCH Balance BCH': string;
    'LTC Amount LTC': string;
    'Trading Fee (LTC) LTC': string;
    'LTC Balance LTC': string;
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
    const realAmount = amount.replace(/[($-,)]/g, '');
    return parseFloat(realAmount.split(' ')[0]);
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
                    const amountSold = parseNumber(trade[`${pair.sold} Amount ${pair.sold}`]);
                    const amountSoldFee = parseNumber(trade[`Trading Fee (${pair.sold}) ${pair.sold}`]);
                    const amountBought = parseNumber(trade[`${pair.bought} Amount ${pair.bought}`]);
                    const amountBoughtFee = parseNumber(trade[`Trading Fee (${pair.bought}) ${pair.bought}`]);
                    const partialTrade: IPartialTrade = {
                        boughtCurrency: pair.bought.toUpperCase(),
                        soldCurrency: pair.sold.toUpperCase(),
                        amountSold: amountSold + amountSoldFee,
                        rate: (amountSold + amountSoldFee) / (amountBought - amountBoughtFee),
                        date: createDateAsUTC(new Date(`${trade['Order Date']} ${trade['Order Time']}`)).getTime(),
                        exchangeID: trade['Trade ID'],
                        exchange: EXCHANGES.Gemini,
                        transactionFeeCurrency: pair.bought.toUpperCase(),
                        transactionFee: 0,
                    };
                    partialTrade.ID = createID(partialTrade);
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

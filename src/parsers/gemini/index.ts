import { getCSVData } from '../';
import { EXCHANGES, ITradeWithUSDRate } from '../../types';
import { getUSDRate } from '../getUSDRate';

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
    for (const key in keys) {
        if (key.indexOf(' Amount') && trade[key] !== undefined && trade[key] !== '') {
            if (trade[key].substring(0, 1) === '-') {
                currencies.sold = key.substring(0, 3);
            } else {
                currencies.bought = key.substring(0, 3);
            }
        }
    }
    return currencies;
}

export async function processData(): Promise<ITradeWithUSDRate[]> {
    const data: IGemini[] = await getCSVData('./src/parsers/bittrex.csv') as IGemini[];
    const internalFormat: ITradeWithUSDRate[] = [];
    for (const trade of data) {
        if (trade.Symbol.length > 3) {
            const pair: ITraded = getCurrenciesTraded(trade);
            switch (trade.Type) {
                case GeminiOrderType.Buy:
                case GeminiOrderType.Sell:
                    internalFormat.push({
                        boughtCurreny: pair.bought,
                        soldCurrency: pair.sold,
                        amountSold: Math.abs(trade[`${pair.sold} Amount`]),
                        rate: Math.abs(trade[`${pair.bought} Amount`]) / Math.abs(trade[`${pair.sold} Amount`]),
                        date: new Date(`${trade['Order Date']} ${trade['Order Time']}`).getTime(),
                        USDRate: (trade.Symbol.indexOf('USD') ?
                        Math.abs(trade[`${pair.bought} Amount`]) / Math.abs(trade[`${pair.sold} Amount`])
                        : await getUSDRate(new Date(`${trade['Order Date']} ${trade['Order Time']}`))),
                        id: trade['Trade ID'],
                        exchange: EXCHANGES.GEMINI,
                    });
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

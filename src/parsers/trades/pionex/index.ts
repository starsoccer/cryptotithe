import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum PionexOrderSide {
    SELL = 'SELL',
    BUY = 'BUY',
}

interface IPionex {
    'date(UTC+0)': string;
    amount: string;
    price: string;
    order_price: string;
    side: string;
    symbol: string;
    state: string;
    fee: string;
    strategy_type: string;
}

export default async function pionexParser(importDetails: IImport): Promise<ITrade[]> {
    if (importDetails.data.split(',')[2] === '\"coin\"') {
        console.log('Detected Pionex dust collector')
        return pionexDustParser(importDetails);
    }
    const data: IPionex[] = await getCSVData(importDetails.data) as IPionex[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const tradeToAdd: IPartialTrade = {
            date: createDateAsUTC(new Date(trade['date(UTC+0)'])).getTime(),
            exchange: EXCHANGES.Pionex,
        };
        if (trade.state === 'CANCELED') {
            console.log('Skipping canceled trade');
            continue;
        }
        if (trade.side.toUpperCase() === PionexOrderSide.BUY) {
            const [boughtCurrency, soldCurrency] = trade.symbol.split('_');
            tradeToAdd.boughtCurrency = boughtCurrency;
            tradeToAdd.soldCurrency = soldCurrency;
            tradeToAdd.amountSold = parseFloat(trade.amount);
            tradeToAdd.rate = parseFloat(trade.price);
        } else if (trade.side.toUpperCase() === PionexOrderSide.SELL) {
            const [soldCurrency, boughtCurrency] = trade.symbol.split('_')
            tradeToAdd.soldCurrency = soldCurrency;
            tradeToAdd.boughtCurrency = boughtCurrency;
            tradeToAdd.amountSold = parseFloat(trade.amount) / parseFloat(trade.price);
            tradeToAdd.rate = 1 / parseFloat(trade.price);
        } else {
            console.error('Trade side unknown');
            continue;
        }
        tradeToAdd.tradeFee = parseFloat(trade.fee);
        tradeToAdd.tradeFeeCurrency = tradeToAdd.boughtCurrency;
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}


interface IPionexDust {
    'date(UTC+0)': string;
    amount: string;
    coin: string;
    price: string;
    swap_value: string;
}

export async function pionexDustParser(importDetails: IImport): Promise<ITrade[]> {
    const data: IPionexDust[] = await getCSVData(importDetails.data) as IPionexDust[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(trade['date(UTC+0)'])).getTime(),
            exchange : EXCHANGES.Pionex,
            boughtCurrency : 'USDT',
            soldCurrency : trade.coin,
            amountSold : parseFloat(trade.amount),
            rate : 1 / parseFloat(trade.price),
        };
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

import { ITrade, ITradeWithUSDRate, IHoldings, ICurrencyHolding, METHOD } from '../types'
import * as faker from 'faker';

export function mockHoldings(currencies: number, holdingsPerCurrency: number, startingDate: Date = new Date(1/1/2010), endingDate: Date = new Date()) {
    const holdings: IHoldings = {};
    for (let i = 0; i < currencies; i++) {
        const toBeHoldings: ICurrencyHolding[] = [];
        for (let hpc = 0; hpc < holdingsPerCurrency; hpc++) {
            toBeHoldings.push({
                amount: faker.random.number(),
                date: faker.date.between(startingDate, endingDate),
                rateInUSD: faker.random.number(),
            });
        }
        holdings[faker.random.word().toUpperCase()] = toBeHoldings;
    }
    return holdings;
}

export function mockTrades(amount: number, startingDate: Date, currentHoldings, allowOverflow: boolean) {
    const trades: ITradeWithUSDRate[] = [];
    const currencies = Object.keys(currentHoldings);
    for(const currency of currencies) {
        let totalHoldings = 0;
        for(const holding of currentHoldings[currency]) {
            totalHoldings += holding.amount
        }
      
        for (let i = 0; i < amount; i++) {
            trades.push({
                boughtCurreny: faker.random.word().toUpperCase(),
                soldCurrency: faker.random.arrayElement(currencies),
                amountSold: (allowOverflow ? totalHoldings + faker.random.number() : faker.random.number(totalHoldings / amount)),
                rate: faker.random.number(),
                date: faker.date.between(startingDate, new Date()),
                USDRate: faker.random.number(),
            });
        }
    }

    return trades;
}

export function mockTradesWithUSDRate (amount: number, startingDate: Date, currentHoldings, allowOverflow: boolean): ITradeWithUSDRate[] {
    const trades = mockTrades(amount, startingDate, currentHoldings, allowOverflow) as ITradeWithUSDRate[];
    for (let trade of trades) {
        trade.USDRate = faker.random.number();
    }
    return trades;
}
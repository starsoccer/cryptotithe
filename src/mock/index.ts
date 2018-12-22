import * as faker from 'faker';
import {
    EXCHANGES,
    FiatRateMethod,
    ICurrencyHolding,
    IHoldings,
    ISavedData,
    ITradeWithFiatRate,
    METHOD,
} from '../types';

export function mockHoldings(
    currencies: number,
    holdingsPerCurrency: number,
    startingDate: Date = new Date(1 / 1 / 2010),
    endingDate: Date = new Date(),
): IHoldings {
    const holdings: IHoldings = {};
    for (let i = 0; i < currencies; i++) {
        const toBeHoldings: ICurrencyHolding[] = [];
        for (let hpc = 0; hpc < holdingsPerCurrency; hpc++) {
            toBeHoldings.push({
                amount: faker.random.number(),
                date: faker.date.between(startingDate, endingDate).getTime(),
                rateInFiat: faker.random.number(),
            });
        }
        holdings[faker.random.word().toUpperCase()] = toBeHoldings;
    }
    return holdings;
}

export function mockTrades(
    amount: number, startingDate: Date, currentHoldings: IHoldings, allowOverflow: boolean,
): ITradeWithFiatRate[] {
    const trades: ITradeWithFiatRate[] = [];
    const currencies: string[] = Object.keys(currentHoldings);
    for (const currency of currencies) {
        let totalHoldings = 0;
        for (const holding of currentHoldings[currency]) {
            totalHoldings += holding.amount;
        }

        for (let i = 0; i < amount; i++) {
            const boughtCurrency = faker.random.word().toUpperCase();
            trades.push({
                boughtCurrency,
                soldCurrency: faker.random.arrayElement(currencies),
                amountSold: (allowOverflow ?
                    totalHoldings + faker.random.number() : (totalHoldings - faker.random.number()) / amount),
                rate: faker.random.number(),
                date: faker.date.between(startingDate, new Date()).getTime(),
                fiatRate: faker.random.number(),
                exchangeID: faker.random.words(5),
                ID: faker.random.words(5),
                exchange: faker.random.objectElement(EXCHANGES) as EXCHANGES,
                transactionFee: 0,
                transactionFeeCurrency: boughtCurrency,
            });
        }
    }

    return trades;
}

export function mockTradesWithFiatRate(
    amount: number, startingDate: Date, currentHoldings: IHoldings, allowOverflow: boolean): ITradeWithFiatRate[] {
    const trades: ITradeWithFiatRate[] = mockTrades(
        amount, startingDate, currentHoldings, allowOverflow);
    for (const trade of trades) {
        trade.fiatRate = faker.random.number();
    }
    return trades;
}

export function createEmptySavedData(): ISavedData {
    const packageData = require('../../package.json');
    return {
        trades: [],
        holdings: {},
        savedDate: new Date(),
        version: packageData.version,
        settings: {
            fiatRateMethod: Object.keys(FiatRateMethod)[0] as keyof typeof FiatRateMethod,
            fiatCurrency: 'USD',
            gainCalculationMethod: METHOD.FIFO,
        },
    };
}

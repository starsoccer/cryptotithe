import * as faker from 'faker';
import { EXCHANGES, FiatRateMethod, ITrade} from '../../types';
import { addFiatRateToTrades } from './';

describe('Add fiat Rate', () => {
    test('one trade', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'LTC',
        };

        const tradeWithFiatRate = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Double Average']);

        expect('fiatRate' in tradeWithFiatRate[0]).toBeTruthy();
        expect(typeof tradeWithFiatRate[0].fiatRate).toBe('number');
    });

    test('3 trades', async () => {
        const trades: ITrade[] = [
            {
                boughtCurrency: 'LTC',
                soldCurrency: 'BTC',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.Gemini,
                transactionFee: 0,
                transactionFeeCurrency: 'LTC',
            },
            {
                boughtCurrency: 'LTC',
                soldCurrency: 'ETH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.Gemini,
                transactionFee: 0,
                transactionFeeCurrency: 'LTC',
            },
            {
                boughtCurrency: 'BTC',
                soldCurrency: 'DASH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.Gemini,
                transactionFee: 0,
                transactionFeeCurrency: 'BTC',
            },
        ];

        const tradesWithFiatRate = await addFiatRateToTrades(trades, 'USD', FiatRateMethod['Double Average']);

        for (const trade of tradesWithFiatRate) {
            expect('fiatRate' in trade).toBeTruthy();
            expect(typeof trade.fiatRate).toBe('number');
        }
    });

    test('fiat trade', async () => {
        const amountSold = faker.random.number();
        const rate = faker.random.number();
        const fiatCurrency = 'USD';
        const trades: ITrade[] = [
            {
                boughtCurrency: faker.random.word(),
                soldCurrency: fiatCurrency,
                amountSold,
                rate,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.Gemini,
                transactionFee: 0,
                transactionFeeCurrency: fiatCurrency,
            },
            {
                boughtCurrency: fiatCurrency,
                soldCurrency: faker.random.word(),
                amountSold,
                rate,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.Gemini,
                transactionFee: 0,
                transactionFeeCurrency: fiatCurrency,
            },
        ];

        const tradeWithFiatRate = await addFiatRateToTrades(trades, fiatCurrency, FiatRateMethod['Double Average']);

        expect('fiatRate' in tradeWithFiatRate[0]).toBeTruthy();
        expect(typeof tradeWithFiatRate[0].fiatRate).toBe('number');
        expect(tradeWithFiatRate[0].fiatRate).toEqual(rate);
        expect(tradeWithFiatRate[1].fiatRate).toEqual(amountSold / rate / amountSold);
    });

    test('non BTC or fiat hour based rates', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'ETH',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'LTC',
        };

        const hourLowTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Low']);
        const hourHighTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour High']);
        const hourAvgTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Avg']);
        const hourCloseTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Close']);
        const hourOpenTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Open']);

        expect(hourLowTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourHighTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourAvgTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourAvgTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourCloseTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourCloseTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourOpenTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourOpenTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);
    });

    test('BTC hour based rates', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'LTC',
        };

        const [
            hourLowTrade,
            hourHighTrade,
            hourAvgTrade,
            hourCloseTrade,
            hourOpenTrade,
        ] = await Promise.all([
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Low']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour High']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Avg']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Close']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Hour Open']),
        ]);

        expect(hourLowTrade[0].fiatRate).toBeDefined();
        expect(hourHighTrade[0].fiatRate).toBeDefined();
        expect(hourLowTrade[0].fiatRate).toBeGreaterThan(0);
        expect(hourHighTrade[0].fiatRate).toBeGreaterThan(0);

        expect(hourAvgTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);
        expect(hourAvgTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);

        expect(hourCloseTrade[0].fiatRate).toBeDefined();
        expect(hourOpenTrade[0].fiatRate).toBeDefined();
        expect(hourCloseTrade[0].fiatRate).toBeGreaterThan(0);
        expect(hourOpenTrade[0].fiatRate).toBeGreaterThan(0);

    });

    test('BTC Day based rates', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'LTC',
        };

        const [dayAvgTrade, dayAvgMiddleTrade, dayAvgVolumeTrade] = await Promise.all([
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Day Average']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Day Average Middle']),
            addFiatRateToTrades([trade], 'USD', FiatRateMethod['Day Average Volume']),
        ]);

        expect(await dayAvgTrade[0].fiatRate).toBeDefined();
        expect(dayAvgMiddleTrade[0].fiatRate).toBeDefined();
        expect(dayAvgVolumeTrade[0].fiatRate).toBeDefined();
        expect(dayAvgTrade[0].fiatRate).toBeGreaterThan(0);
        expect(dayAvgMiddleTrade[0].fiatRate).toBeGreaterThan(0);
        expect(dayAvgVolumeTrade[0].fiatRate).toBeGreaterThan(0);

    });
});

import * as faker from 'faker';
import { EXCHANGES, ITrade, ITradeWithFiatRate, FiatRateMethod} from '../../types';
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
            exchange: EXCHANGES.GEMINI,
        };

        const tradeWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.DOUBLEAVERAGE);

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
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: 'LTC',
                soldCurrency: 'ETH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: 'BTC',
                soldCurrency: 'DASH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.GEMINI,
            },
        ];

        const tradesWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(trades, 'USD', FiatRateMethod.DOUBLEAVERAGE);

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
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: fiatCurrency,
                soldCurrency: faker.random.word(),
                amountSold,
                rate,
                date: faker.date.past(1).getTime(),
                ID: '1',
                exchangeID: '1',
                exchange: EXCHANGES.GEMINI,
            }
        ];

        const tradeWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(trades, fiatCurrency, FiatRateMethod.DOUBLEAVERAGE);

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
            exchange: EXCHANGES.GEMINI,
        };

        const hourLowTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURLOW);
        const hourHighTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURHIGH);
        const hourAvgTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURAVG);
        const hourCloseTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURCLOSE);
        const hourOpenTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOUROPEN);

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
            exchange: EXCHANGES.GEMINI,
        };

        const hourLowTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURLOW);
        const hourHighTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURHIGH);
        const hourAvgTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURAVG);
        const hourCloseTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOURCLOSE);
        const hourOpenTrade = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.HOUROPEN);

        expect(hourLowTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourHighTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourAvgTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourAvgTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourCloseTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourCloseTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);

        expect(hourOpenTrade[0].fiatRate).toBeLessThanOrEqual(hourHighTrade[0].fiatRate);
        expect(hourOpenTrade[0].fiatRate).toBeGreaterThanOrEqual(hourLowTrade[0].fiatRate);
    });
});
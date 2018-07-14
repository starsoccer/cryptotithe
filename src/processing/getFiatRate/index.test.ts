import * as faker from 'faker';
import { EXCHANGES, IHoldings, ITrade, ITradeWithUSDRate} from '../../types';
import { addUSDRateToTrade, addUSDRateToTrades, BTCBasedRate, getUSDRate } from './';

describe('Add USD Rate to Trade', () => {
    test('add USD rate to one trade', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };

        const tradeWithUSDRate: ITradeWithUSDRate = await addUSDRateToTrade(trade);

        expect('USDRate' in tradeWithUSDRate).toBeTruthy();
        expect(typeof tradeWithUSDRate.USDRate).toBe('number');
    });
});

describe('Add USD Rate to Trades', () => {
    test('add USD rate to 3 trades', async () => {
        const trades: ITrade[] = [
            {
                boughtCurrency: 'LTC',
                soldCurrency: 'BTC',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                id: '1',
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: 'LTC',
                soldCurrency: 'ETH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                id: '1',
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: 'BTC',
                soldCurrency: 'DASH',
                amountSold: 5,
                rate: 1,
                date: faker.date.past(1).getTime(),
                id: '1',
                exchange: EXCHANGES.GEMINI,
            },
        ];

        const tradesWithUSDRate: ITradeWithUSDRate[] = await addUSDRateToTrades(trades);

        for (const trade of tradesWithUSDRate) {
            expect('USDRate' in trade).toBeTruthy();
            expect(typeof trade.USDRate).toBe('number');
        }
    });
});

describe('Get USD Rate', () => {
    const date = new Date(1508087399612); // random but fixed date for testing
    test('add USD rate to BTC Sold trade', () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: date.getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };
        const rate = BTCBasedRate(trade, 1000);
        expect(rate).toBe(1000);
    });

    test('add USD rate to BTC Bought trade', () => {
        const trade: ITrade = {
            boughtCurrency: 'BTC',
            soldCurrency: 'LTC',
            amountSold: 5,
            rate: 0.01,
            date: date.getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };
        const rate = BTCBasedRate(trade, 1000);
        expect(rate).toBe(1000 * (trade.amountSold / trade.rate) / trade.amountSold);
    });

    test('add USD rate to USD Bought trade', async () => {
        const trade: ITrade = {
            boughtCurrency: 'USD',
            soldCurrency: 'BTC',
            amountSold: faker.random.number(),
            rate: faker.random.number(),
            date: date.getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };
        const rate = await getUSDRate(trade);
        expect(rate).toBe(trade.amountSold / trade.rate / trade.amountSold);
    });

    test('add USD rate to USD Sold trade', async () => {
        const trade: ITrade = {
            boughtCurrency: 'BTC',
            soldCurrency: 'USD',
            amountSold: faker.random.number(),
            rate: faker.random.number(),
            date: date.getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };
        const rate = await getUSDRate(trade);
        expect(rate).toBe(trade.rate);
    });
});

import * as faker from 'faker';
import { EXCHANGES, IHoldings, ITrade, ITradeWithUSDRate, FiatRateMethod} from '../../types';
import { addFiatRateToTrades } from './';

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

        const tradeWithUSDRate: ITradeWithUSDRate[] = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.BITCOINAVERAGE);

        expect('USDRate' in tradeWithUSDRate[0]).toBeTruthy();
        expect(typeof tradeWithUSDRate[0].USDRate).toBe('number');
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

        const tradesWithUSDRate: ITradeWithUSDRate[] = await addFiatRateToTrades(trades, 'USD', FiatRateMethod.BITCOINAVERAGE);

        for (const trade of tradesWithUSDRate) {
            expect('USDRate' in trade).toBeTruthy();
            expect(typeof trade.USDRate).toBe('number');
        }
    });
});

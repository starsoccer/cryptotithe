import * as faker from 'faker';
import { EXCHANGES, IHoldings, ITrade, ITradeWithFiatRate, FiatRateMethod} from '../../types';
import { addFiatRateToTrades } from './';

describe('Add fiat Rate to Trade', () => {
    test('add fiat rate to one trade', async () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.past(1).getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        };

        const tradeWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades([trade], 'USD', FiatRateMethod.DOUBLEAVERAGE);

        expect('fiatRate' in tradeWithFiatRate[0]).toBeTruthy();
        expect(typeof tradeWithFiatRate[0].fiatRate).toBe('number');
    });
});

describe('Add fiat Rate to Trades', () => {
    test('add fiat rate to 3 trades', async () => {
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

        const tradesWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(trades, 'USD', FiatRateMethod.DOUBLEAVERAGE);

        for (const trade of tradesWithFiatRate) {
            expect('fiatRate' in trade).toBeTruthy();
            expect(typeof trade.fiatRate).toBe('number');
        }
    });
});

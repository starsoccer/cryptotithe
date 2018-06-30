import * as faker from 'faker';
import { mockHoldings, mockTradesWithUSDRate } from '../../mock';
import { EXCHANGES, IHoldings, ITradeWithUSDRate, METHOD} from '../../types';
import sortTrades from './';

describe('Sort Trades', () => {
    test('By Date no overflow', () => {
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(
            faker.random.number(100) + 5,
            faker.date.past(),
            mockHoldings(faker.random.number(10) + 5, faker.random.number(10) + 5, faker.date.past()),
            false,
        );

        const sortedTrades = sortTrades(trades);

        for (let i = 1; i < sortedTrades.length; i++) {
            expect(trades[i].date > trades[i - 1].date).toBeTruthy();
        }
    });

    test('By Date no overflow', () => {
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(
            faker.random.number(100) + 5,
            faker.date.past(),
            mockHoldings(faker.random.number(10) + 5, faker.random.number(10) + 5, faker.date.past()),
            true,
        );

        const sortedTrades = sortTrades(trades);

        for (let i = 1; i < sortedTrades.length; i++) {
            expect(trades[i].date > trades[i - 1].date).toBeTruthy();
        }
    });
});

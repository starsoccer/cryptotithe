import * as faker from 'faker';
import { EXCHANGES, ITrade } from '../../../types';
import { BTCBasedRate } from './';

describe('Get Fiat Rate', () => {

    test('add Fiat rate to BTC Sold trade', () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: faker.date.recent().getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'LTC',
        };
        const rate = BTCBasedRate(trade, 1000);
        expect(rate).toBe(1000);
    });

    test('add Fiat rate to BTC Bought trade', () => {
        const trade: ITrade = {
            boughtCurrency: 'BTC',
            soldCurrency: 'LTC',
            amountSold: 5,
            rate: 0.01,
            date: faker.date.recent().getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.Gemini,
            transactionFee: 0,
            transactionFeeCurrency: 'BTC',
        };
        const rate = BTCBasedRate(trade, 1000);
        expect(rate).toBe(1000 * (trade.amountSold / trade.rate) / trade.amountSold);
    });
});
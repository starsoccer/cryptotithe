import { EXCHANGES, ITrade } from '../../../types';
import { BTCBasedRate } from './'

describe('Get Fiat Rate', () => {
    const date = new Date(1508087399612); // random but fixed date for testing
    test('add Fiat rate to BTC Sold trade', () => {
        const trade: ITrade = {
            boughtCurrency: 'LTC',
            soldCurrency: 'BTC',
            amountSold: 5,
            rate: 1,
            date: date.getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.GEMINI,
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
            date: date.getTime(),
            ID: '1',
            exchangeID: '1',
            exchange: EXCHANGES.GEMINI,
            transactionFee: 0,
            transactionFeeCurrency: 'BTC',
        };
        const rate = BTCBasedRate(trade, 1000);
        expect(rate).toBe(1000 * (trade.amountSold / trade.rate) / trade.amountSold);
    });
});
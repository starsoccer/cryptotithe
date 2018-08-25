import { mockHoldings, mockTradesWithFiatRate } from '../../mock';
import { EXCHANGES, IHoldings, ITradeWithFiatRate, METHOD} from '../../types';
import { calculateGains, getCurrenyHolding, ICalculateGains, IGetCurrencyHolding } from './';

const fiatCurrency = 'FAKE';

function calculateGainsOneAtATime(holdings: IHoldings, trades: ITradeWithFiatRate[]) {
    let shortTermGain = 0;
    let longTermGain = 0;
    for (const trade of trades) {
        // Since we know 1 trade at a time returns the right result this checks that doing
        // each one manually equals the same thing as putting them all in at once.
        const output = calculateGains(holdings, [trade]);
        holdings = output.newHoldings;
        shortTermGain += output.shortTermGain;
        longTermGain += output.longTermGain;
    }
    return {
        shortTerm: shortTermGain,
        longTerm: longTermGain,
    };
}

describe('calculateGains 1 currency manual', () => {

    test('structured unchanged', () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date('1/1/2018'));
        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);

        expect('newHoldings' in result).toBeTruthy();
        expect('shortTermGain' in result).toBeTruthy();
        expect('longTermGain' in result).toBeTruthy();

    });

    test('1 holding, 1 trade, short term, no overflow', () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency: string = Object.keys(holdings)[0];
        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);
        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].fiatRate - holdings[currency][0].rateInFiat) * trades[0].amountSold);
    });

    test('1 holding, 1 trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].fiatRate - holdings[currency][0].rateInFiat)
            * holdings[currency][0].amount + trades[0].fiatRate * (trades[0].amountSold - holdings[currency][0].amount),
        );
    });

    test('1 holding, 1 trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);
        expect(result.longTermGain).toBe((trades[0].fiatRate - holdings[currency][0].rateInFiat) * trades[0].amountSold);
    });

    test('1 holding, 1 trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(trades[0].fiatRate * (trades[0].amountSold - holdings[currency][0].amount));
        expect(result.longTermGain).toBe((trades[0].fiatRate - holdings[currency][0].rateInFiat) *
            holdings[currency][0].amount);
    });

    test('1 holding, multiple trades, short term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.fiatRate - holdings[currency][0].rateInFiat) * trade.amountSold;
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, short term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.fiatRate - holdings[currency][0].rateInFiat)
            * holdings[currency][0].amount + trade.fiatRate * (trade.amountSold - holdings[currency][0].amount);
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, long term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.fiatRate - holdings[currency][0].rateInFiat) * trade.amountSold;
        }

        expect(result.longTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, long term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.fiatRate - holdings[currency][0].rateInFiat) *
                holdings[currency][0].amount + trade.fiatRate * (trade.amountSold - holdings[currency][0].amount);
        }

        expect(result.longTermGain + result.shortTermGain).toBe(estimatedGain);
    });

    test('multiple holdings, 1 trade, short term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].fiatRate - holding.rateInFiat) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('multiple holdings, 1 trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].fiatRate - holding.rateInFiat) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(estimatedGain + amountLeft * trades[0].fiatRate);
    });

    test('multiple holdings, 1 trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].fiatRate - holding.rateInFiat) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(estimatedGain);
        expect(result.shortTermGain).toBe(0);
    });

    test('multiple holdings, 1 trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].fiatRate - holding.rateInFiat) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(estimatedGain);
        expect(result.shortTermGain).toBe(amountLeft * trades[0].fiatRate);
    });

    test('multiple holdings, multiple trade, short term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const trades = mockTradesWithFiatRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        expect(result.longTermGain).toBe(0);
        // rounding needed to avoid weird float issues
        expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
    });

    test('multiple holdings, multiple trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const trades = mockTradesWithFiatRate(5, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        expect(result.longTermGain).toBe(0);
        // rounding needed to avoid weird float issues
        expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
    });

    test('multiple holdings, multiple trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const trades = mockTradesWithFiatRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        // rounding needed to avoid weird float issues
        expect(Math.round(result.longTermGain)).toBe(Math.round(oneAtATimeGains.longTerm));
        expect(result.shortTermGain).toBe(0);
    });

    test('multiple holdings, multiple trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const trades = mockTradesWithFiatRate(5, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        // rounding needed to avoid weird float issues
        expect(Math.round(result.longTermGain)).toBe(Math.round(oneAtATimeGains.longTerm));
        expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
    });
});

describe('calculateGains 1/multiple currencies automated', () => {
    const testTypes = {
        currenciesCount: [1, 5],
        holdingsCount: [1, 5],
        tradesCount: [1, 5],
        shortTermTypes: [true, false],
        overflowTypes: [true, false],
    };

    for (const currencyCount of testTypes.currenciesCount) {
        for (const holdingCount of testTypes.holdingsCount) {
            for (const tradeCount of testTypes.tradesCount) {
                for (const shortTerm of testTypes.shortTermTypes) {
                    for (const overflowType of testTypes.overflowTypes) {
                        const testName = `${currencyCount} currencies, ${holdingCount} holding, ${tradeCount} trade, ` +
                            `${shortTerm ? 'Short' : 'Long'} term, ${overflowType ? '' : 'no'} overflow`;
                        test(testName, () => {
                            const holdings = mockHoldings(
                                currencyCount,
                                holdingCount,
                                (shortTerm ? new Date('1/1/2018') : new Date('1/1/2015')),
                                (shortTerm ? new Date('1/31/2018') : new Date('1/1/2016')),
                            );
                            const trades = mockTradesWithFiatRate(
                                tradeCount, new Date('2/2/2018'), holdings, overflowType,
                            );

                            const result = calculateGains(holdings, trades);
                            const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

                            // rounding needed to avoid weird float issues
                            expect(Math.round(result.longTermGain)).toBe(Math.round(oneAtATimeGains.longTerm));
                            expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
                        });
                    }
                }
            }
        }
    }
});

describe('calculateGains fiat', () => {

    test('fiat holdings', () => {
        const tempHoldings = mockHoldings(1, 1, new Date('1/1/2018'));
        const holdings: IHoldings = {[fiatCurrency]: tempHoldings[Object.keys(tempHoldings)[0]]};

        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades, fiatCurrency);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(0);
    });

    test('fiat trades', () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date('1/1/2018'));

        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        trades[0].boughtCurrency = fiatCurrency;
        const result: ICalculateGains = calculateGains(holdings, trades, fiatCurrency);
        const currency = Object.keys(holdings)[0];
        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].fiatRate - holdings[currency][0].rateInFiat) * trades[0].amountSold);
    });

    test('basic fiat buy', () => {
        const holdings: IHoldings = {};

        const trades: ITradeWithFiatRate[] = [{
            boughtCurrency: 'BTC',
            soldCurrency: fiatCurrency,
            amountSold: 1000,
            rate: 200,
            fiatRate: 200,
            date: new Date().getTime(),
            id: '1',
            exchange: EXCHANGES.GEMINI,
        }];
        const result: ICalculateGains = calculateGains(holdings, trades, fiatCurrency);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(0);

    });

    test('basic fiat buy/sell', () => {
        const holdings: IHoldings = {};
        const trades: ITradeWithFiatRate[] = [
            {
                boughtCurrency: 'BTC',
                soldCurrency: fiatCurrency,
                amountSold: 1000,
                rate: 200,
                fiatRate: 200,
                date: new Date().getTime(),
                id: '1',
                exchange: EXCHANGES.GEMINI,
            },
            {
                boughtCurrency: fiatCurrency,
                soldCurrency: 'BTC',
                amountSold: 1,
                rate: 0.001,
                fiatRate: 1000,
                date: new Date().getTime(),
                id: '1',
                exchange: EXCHANGES.GEMINI,
            },
        ];
        const result: ICalculateGains = calculateGains(holdings, trades, fiatCurrency);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(800);

    });
});

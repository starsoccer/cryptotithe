import { mockHoldings, mockTradesWithUSDRate } from '../mock';
import { IHoldings, ITradeWithUSDRate, METHOD} from '../types';
import { calculateGains, getCurrenyHolding, ICalculateGains, IGetCurrencyHolding } from './CalculateGains';

describe('getCurrencyHolding LIFO', () => {
    test('One Holdings', () => {
        const holdings: IHoldings  = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.LIFO);

        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });

    test('More then one Holdings', () => {
        const holdings: IHoldings = mockHoldings(1, 5);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.LIFO);

        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][4].amount - result.newHoldings[currency][4].amount).toBe(1);
    });
});

describe('getCurrencyHolding FIFO', () => {

    test('default to FIFO', () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1);

        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });

    test('One Holdings', () => {
        const holdings: IHoldings = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.FIFO);

        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });

    test('More then one Holdings', () => {
        const holdings: IHoldings = mockHoldings(1, 5);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.FIFO);

        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });
});

describe('getCurrencyHolding Overflow', () => {

    test('with one holding', () => {
        const holdings: IHoldings = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, holdings[currency][0].amount + 1);
        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(holdings[currency][0].amount + 1);
        expect(result.deductedHoldings.length).toBe(2);
        expect(result.deductedHoldings[1].amount).toBe(1);
        expect(result.deductedHoldings[1].rateInUSD).toBe(0);
        expect(result.deductedHoldings[1].date - new Date().getTime()).toBeLessThan(60000);
        expect(Object.keys(result.newHoldings).length).toBe(0);
    });

    test('with multiple holdings', () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        let totalAmount: number = 1;
        for (const holding of holdings[currency]) {
            totalAmount += holding.amount;
        }
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, totalAmount);
        expect('deductedHoldings' in result).toBeTruthy();
        expect('newHoldings' in result).toBeTruthy();
        let totalReduced: number = 0;
        for (const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(totalAmount);
        expect(result.deductedHoldings.length).toBe(4);
        expect(result.deductedHoldings[3].amount).toBe(1);
        expect(result.deductedHoldings[3].rateInUSD).toBe(0);
        expect(result.deductedHoldings[3].date - new Date().getTime()).toBeLessThan(60000);
        expect(Object.keys(result.newHoldings).length).toBe(0);
    });
});

function calculateGainsOneAtATime(holdings: IHoldings, trades: ITradeWithUSDRate[]) {
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
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);

        expect('newHoldings' in result).toBeTruthy();
        expect('shortTermGain' in result).toBeTruthy();
        expect('longTermGain' in result).toBeTruthy();

    });

    test('1 holding, 1 trade, short term, no overflow', () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency: string = Object.keys(holdings)[0];
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);
        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].USDRate - holdings[currency][0].rateInUSD) * trades[0].amountSold);
    });

    test('1 holding, 1 trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].USDRate - holdings[currency][0].rateInUSD)
            * holdings[currency][0].amount + trades[0].USDRate * (trades[0].amountSold - holdings[currency][0].amount),
        );
    });

    test('1 holding, 1 trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);
        expect(result.longTermGain).toBe((trades[0].USDRate - holdings[currency][0].rateInUSD) * trades[0].amountSold);
    });

    test('1 holding, 1 trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(trades[0].USDRate * (trades[0].amountSold - holdings[currency][0].amount));
        expect(result.longTermGain).toBe((trades[0].USDRate - holdings[currency][0].rateInUSD) *
            holdings[currency][0].amount);
    });

    test('1 holding, multiple trades, short term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.USDRate - holdings[currency][0].rateInUSD) * trade.amountSold;
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, short term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.USDRate - holdings[currency][0].rateInUSD)
            * holdings[currency][0].amount + trade.USDRate * (trade.amountSold - holdings[currency][0].amount);
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, long term, no overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.USDRate - holdings[currency][0].rateInUSD) * trade.amountSold;
        }

        expect(result.longTermGain).toBe(estimatedGain);
    });

    test('1 holding, multiple trades, long term, overflow', () => {
        const holdings = mockHoldings(1, 1, new Date('1/1/2010'), new Date('1/1/2012'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        for (const trade of trades) {
            estimatedGain += (trade.USDRate - holdings[currency][0].rateInUSD) *
                holdings[currency][0].amount + trade.USDRate * (trade.amountSold - holdings[currency][0].amount);
        }

        expect(result.longTermGain + result.shortTermGain).toBe(estimatedGain);
    });

    test('multiple holdings, 1 trade, short term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].USDRate - holding.rateInUSD) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test('multiple holdings, 1 trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].USDRate - holding.rateInUSD) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe(estimatedGain + amountLeft * trades[0].USDRate);
    });

    test('multiple holdings, 1 trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].USDRate - holding.rateInUSD) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(estimatedGain);
        expect(result.shortTermGain).toBe(0);
    });

    test('multiple holdings, 1 trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        let amountLeft = trades[0].amountSold;
        for (const holding of holdings[currency]) {
            if (amountLeft > 0) {
                const amountToDeduct = amountLeft > holding.amount ? holding.amount : amountLeft;
                amountLeft -= amountToDeduct;
                estimatedGain += (trades[0].USDRate - holding.rateInUSD) * amountToDeduct;
            }
        }

        expect(result.longTermGain).toBe(estimatedGain);
        expect(result.shortTermGain).toBe(amountLeft * trades[0].USDRate);
    });

    test('multiple holdings, multiple trade, short term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const trades = mockTradesWithUSDRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        expect(result.longTermGain).toBe(0);
        // rounding needed to avoid weird float issues
        expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
    });

    test('multiple holdings, multiple trade, short term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2018'));
        const trades = mockTradesWithUSDRate(5, new Date('2/2/2018'), holdings, true);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        expect(result.longTermGain).toBe(0);
        // rounding needed to avoid weird float issues
        expect(Math.round(result.shortTermGain)).toBe(Math.round(oneAtATimeGains.shortTerm));
    });

    test('multiple holdings, multiple trade, long term, no overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const trades = mockTradesWithUSDRate(5, new Date('2/2/2018'), holdings, false);

        const result = calculateGains(holdings, trades);
        const oneAtATimeGains = calculateGainsOneAtATime(holdings, trades);

        // rounding needed to avoid weird float issues
        expect(Math.round(result.longTermGain)).toBe(Math.round(oneAtATimeGains.longTerm));
        expect(result.shortTermGain).toBe(0);
    });

    test('multiple holdings, multiple trade, long term, overflow', () => {
        const holdings = mockHoldings(1, 5, new Date('1/1/2015'), new Date('1/1/2016'));
        const trades = mockTradesWithUSDRate(5, new Date('2/2/2018'), holdings, true);

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
                            const trades = mockTradesWithUSDRate(
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

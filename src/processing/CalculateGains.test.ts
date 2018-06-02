import { calculateGains, getCurrenyHolding, ICalculateGains, IGetCurrencyHolding } from "./CalculateGains";
import { mockHoldings, mockTradesWithUSDRate } from "../mock";
import {ITradeWithUSDRate, IHoldings, ICurrencyHolding, METHOD} from "../types";

describe("getCurrencyHolding LIFO", () => {
    test("One Holdings", () => {
        const holdings: IHoldings  = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.LIFO);

        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });


    test("More then one Holdings", () => {
        const holdings: IHoldings = mockHoldings(1, 5);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.LIFO);

        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][4].amount - result.newHoldings[currency][4].amount).toBe(1);
    });
});

describe("getCurrencyHolding FIFO", () => {

    test("default to FIFO", () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1);

        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });

    test("One Holdings", () => {
        const holdings: IHoldings = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.FIFO);

        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });


    test("More then one Holdings", () => {
        const holdings: IHoldings = mockHoldings(1, 5);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, 1, METHOD.FIFO);

        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(1);
        expect(holdings[currency][0].amount - result.newHoldings[currency][0].amount).toBe(1);
    });
});

describe("getCurrencyHolding Overflow", () => {

    test("with one holding", () => {
        const holdings: IHoldings = mockHoldings(1, 1);
        const currency: string = Object.keys(holdings)[0];
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, holdings[currency][0].amount + 1);
        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(holdings[currency][0].amount + 1);
        expect(result.deductedHoldings.length).toBe(2);
        expect(result.deductedHoldings[1].amount).toBe(1);
        expect(result.deductedHoldings[1].rateInUSD).toBe(0);
        expect(result.deductedHoldings[1].date.getDate() - new Date().getTime()).toBeLessThan(60000);
        expect(Object.keys(result.newHoldings).length).toBe(0);
    });


    test("with multiple holdings", () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        let totalAmount: number = 1;
        for(const holding of holdings[currency]) {
            totalAmount += holding.amount;
        }
        const result: IGetCurrencyHolding = getCurrenyHolding(holdings, currency, totalAmount);
        expect("deductedHoldings" in result).toBeTruthy();
        expect("newHoldings" in result).toBeTruthy();
        let totalReduced: number = 0;
        for(const deductedHolding of result.deductedHoldings) {
            totalReduced += deductedHolding.amount;
        }
        expect(totalReduced).toBe(totalAmount);
        expect(result.deductedHoldings.length).toBe(4);
        expect(result.deductedHoldings[3].amount).toBe(1);
        expect(result.deductedHoldings[3].rateInUSD).toBe(0);
        expect(result.deductedHoldings[3].date.getDate() - new Date().getTime()).toBeLessThan(60000);
        expect(Object.keys(result.newHoldings).length).toBe(0);
    });
});

describe("calculateGains", () => {

    test("structured unchanged", () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date("1/1/2018"));
        const currency: string = Object.keys(holdings)[0];
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);

        expect("newHoldings" in result).toBeTruthy();
        expect("shortTermGain" in result).toBeTruthy();
        expect("longTermGain" in result).toBeTruthy();

    });

    test("1 holding, 1 trade, short term, no overflow", () => {
        const holdings: IHoldings = mockHoldings(1, 1, new Date("1/1/2018"));
        const currency: string = Object.keys(holdings)[0];
        const trades: ITradeWithUSDRate[] = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, false);
        const result: ICalculateGains = calculateGains(holdings, trades);
        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].USDRate - holdings[currency][0].rateInUSD) * trades[0].amountSold);
    });
    /*

    test("1 holding, 1 trade, short term, overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2018"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].rate - holdings[currency][0].cost)
            * holdings[currency][0].amount + trades[0].rate * (trades[0].amountSold - holdings[currency][0].amount)
        );
    });

    test("1 holding, 1 trade, long term, no overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2010"), new Date("1/1/2012"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);
        expect(result.longTermGain).toBe((trades[0].rate - holdings[currency][0].cost) * trades[0].amountSold);
    });

    test("1 holding, 1 trade, long term, overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2010"), new Date("1/1/2012"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(trades[0].rate * (trades[0].amountSold - holdings[currency][0].amount));
        expect(result.longTermGain).toBe((trades[0].rate - holdings[currency][0].cost) * holdings[currency][0].amount);
    });

    test("1 holding, multiple trades, short term, no overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2018"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(5, new Date("2/2/2018"), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for(const trade of trades) {
            estimatedGain += (trade.rate - holdings[currency][0].cost) * trade.amountSold;
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test("1 holding, multiple trades, short term, overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2018"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, true);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);

        let estimatedGain = 0;
        for(const trade of trades) {
            estimatedGain += (trade.rate - holdings[currency][0].cost)
            * holdings[currency][0].amount + trade.rate * (trade.amountSold - holdings[currency][0].amount)
        }

        expect(result.shortTermGain).toBe(estimatedGain);
    });

    test("1 holding, multiple trades, long term, no overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2010"), new Date("1/1/2012"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, false);

        const result = calculateGains(holdings, trades);

        expect(result.shortTermGain).toBe(0);

        let estimatedGain = 0;
        for(const trade of trades) {
            estimatedGain += (trade.rate - holdings[currency][0].cost) * trade.amountSold;
        }

        expect(result.longTermGain).toBe(estimatedGain);
    });

    test("1 holding, multiple trades, long term, overflow", () => {
        const holdings = mockHoldings(1, 1, new Date("1/1/2010"), new Date("1/1/2012"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, true);

        const result = calculateGains(holdings, trades);

        let estimatedGain = 0;
        for(const trade of trades) {
            estimatedGain += (trade.rate - holdings[currency][0].cost) *
                holdings[currency][0].amount + trade.rate * (trade.amountSold - holdings[currency][0].amount)
        }

        expect(result.longTermGain + result.shortTermGain).toBe(estimatedGain);
    });

    test("multiple holdings, 1 trade, short term, no overflow", () => {
        const holdings = mockHoldings(1, 5, new Date("1/1/2018"));
        const currency = Object.keys(holdings)[0];
        const trades = mockTradesWithUSDRate(1, new Date("2/2/2018"), holdings, false);

        console.log(holdings);
        console.log(trades);

        const result = calculateGains(holdings, trades);

        expect(result.longTermGain).toBe(0);
        expect(result.shortTermGain).toBe((trades[0].rate - holdings[currency][0].cost) * trades[0].amountSold);
    });
    */













});
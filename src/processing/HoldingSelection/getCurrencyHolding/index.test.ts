import { mockHoldings } from '../../../mock';
import { IHoldings, METHOD, ITrade, EXCHANGES } from '../../../types';
import * as faker from 'faker';
import getCurrencyHolding from './';
const FULL_YEAR_IN_MILLISECONDS = 31536000000;

function pastDate (years: number) {
    return new Date(faker.date.recent().getTime() - FULL_YEAR_IN_MILLISECONDS * years)
}

const trade: ITrade = {
    boughtCurrency: 'FAKE',
    soldCurrency: faker.random.word(),
    amountSold: faker.random.number(),
    rate: faker.random.number(),
    date: faker.date.recent().getTime(),
    exchangeID: faker.random.uuid(),
    ID: faker.random.uuid(),
    exchange: faker.random.word() as EXCHANGES,
};

describe('getCurrencyHolding basic', () => {
    test('FIFO', () => {
        const holdings: IHoldings = mockHoldings(1, 10);
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        const result = getCurrencyHolding(holdings, METHOD.FIFO, trade);
        expect(result.startingIndex).toBe(0);
        expect(result.endingIndex).toBe(1);
        expect(result.holding).toBe(holdings[currency][0]);
        expect(result.holding).toBe(holdings[currency].splice(result.startingIndex, result.endingIndex)[0]);
    });

    test('LIFO', () => {
        const holdings: IHoldings = mockHoldings(1, 10);
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        const result = getCurrencyHolding(holdings, METHOD.LIFO, trade);
        expect(result.startingIndex).toBe(-1);
        expect(result.endingIndex).toBe(1);
        expect(result.holding).toBe(holdings[currency][holdings[currency].length - 1]);
        expect(result.holding).toBe(holdings[currency].splice(result.startingIndex, result.endingIndex)[0]);
    });

    test('HCFO', () => {
        const holdings: IHoldings = mockHoldings(1, 10);
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        const result = getCurrencyHolding(holdings, METHOD.HCFO, trade);
        let highestCostPosition = 0;
        for (let index = 1; index < holdings[trade.soldCurrency].length; index++) {
            const holding = holdings[trade.soldCurrency][index];
            if (holding.rateInFiat > holdings[trade.soldCurrency][highestCostPosition].rateInFiat) {
                highestCostPosition = index;
            }
        }
        expect(result.startingIndex).toBe(highestCostPosition);
        expect(result.endingIndex).toBe(1);

        expect(result.holding).toBe(holdings[trade.soldCurrency][highestCostPosition]);
        expect(result.holding).toBe(holdings[currency].splice(result.startingIndex, result.endingIndex)[0]);
    });

    test('LCFO', () => {
        const holdings: IHoldings = mockHoldings(1, 10);
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        const result = getCurrencyHolding(holdings, METHOD.LCFO, trade);
        let lowestCostPosition = 0;
        for (let index = 1; index < holdings[trade.soldCurrency].length; index++) {
            const holding = holdings[trade.soldCurrency][index];
            if (holding.rateInFiat < holdings[trade.soldCurrency][lowestCostPosition].rateInFiat) {
                lowestCostPosition = index;
            }
        }
        expect(result.startingIndex).toBe(lowestCostPosition);
        expect(result.endingIndex).toBe(1);

        expect(result.holding).toBe(holdings[trade.soldCurrency][lowestCostPosition]);
        expect(result.holding).toBe(holdings[currency].splice(result.startingIndex, result.endingIndex)[0]);
    });


});

describe('getCurrencyHolding advanced', () => {
    test('HTFO Short Term', () => {
        const holdings: IHoldings = mockHoldings(1, 10, faker.date.past(0), faker.date.recent());
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const HTFOResult = getCurrencyHolding(holdings, METHOD.HTFO, trade);
        const LCFOResult = getCurrencyHolding(holdings, METHOD.LCFO, trade);

        expect(HTFOResult.startingIndex).toBe(LCFOResult.startingIndex);
        expect(HTFOResult.endingIndex).toBe(LCFOResult.endingIndex);

        expect(HTFOResult.holding).toBe(LCFOResult.holding);
    });

    test('HTFO Long Term', () => {
        const holdings: IHoldings = mockHoldings(1, 10, pastDate(3), pastDate(2));
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const HTFOResult = getCurrencyHolding(holdings, METHOD.HTFO, trade);
        const LCFOResult = getCurrencyHolding(holdings, METHOD.LCFO, trade);

        expect(HTFOResult.startingIndex).toBe(LCFOResult.startingIndex);
        expect(HTFOResult.endingIndex).toBe(LCFOResult.endingIndex);

        expect(HTFOResult.holding).toBe(LCFOResult.holding);
    });

    test('HTFO Short and Long Term', () => {
        const holdings: IHoldings = mockHoldings(1, 10, pastDate(3), pastDate(2));
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const HTFOResult = getCurrencyHolding(holdings, METHOD.HTFO, trade);

        const shortTermHoldings = [];
        const longTermHoldings = [];
        for (const holding of holdings[currency]) {
            if (trade.date - holding.date >= FULL_YEAR_IN_MILLISECONDS) {
                longTermHoldings.push(holding);
            } else {
                shortTermHoldings.push(holding);
            }
        }

        const LCFOResult = getCurrencyHolding({[currency]: (longTermHoldings.length ? longTermHoldings : shortTermHoldings)}, METHOD.LCFO, trade);
        let LCFOindex = 0;
        holdings[currency].find((holding, index) => {
            if(holding === LCFOResult.holding){
                LCFOindex = index;
                return true;
            } return false;
        });
        expect(HTFOResult.startingIndex).toBe(LCFOindex);
        expect(HTFOResult.endingIndex).toBe(LCFOResult.endingIndex);
    
        expect(HTFOResult.holding).toBe(LCFOResult.holding);
    });

    test('LTFO Short Term', () => {
        const holdings: IHoldings = mockHoldings(1, 10, faker.date.past(0), faker.date.recent());
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const LTFOResult = getCurrencyHolding(holdings, METHOD.LTFO, trade);
        const HCFOResult = getCurrencyHolding(holdings, METHOD.HCFO, trade);

        expect(LTFOResult.startingIndex).toBe(HCFOResult.startingIndex);
        expect(LTFOResult.endingIndex).toBe(HCFOResult.endingIndex);

        expect(LTFOResult.holding).toBe(HCFOResult.holding);
    });

    test('LTFO Long Term', () => {        
        const holdings: IHoldings = mockHoldings(1, 10, pastDate(4), pastDate(3));
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const LTFOResult = getCurrencyHolding(holdings, METHOD.LTFO, trade);
        const HCFOResult = getCurrencyHolding(holdings, METHOD.HCFO, trade);

        expect(LTFOResult.startingIndex).toBe(HCFOResult.startingIndex);
        expect(LTFOResult.endingIndex).toBe(HCFOResult.endingIndex);

        expect(LTFOResult.holding).toBe(HCFOResult.holding);
    });

    test('LTFO Short and Long Term', () => {
        const holdings: IHoldings = mockHoldings(1, 10, pastDate(4), pastDate(3));
        const currency: string = Object.keys(holdings)[0];
        trade.soldCurrency = currency;
        trade.date = new Date().getTime();
        const LTFOResult = getCurrencyHolding(holdings, METHOD.LTFO, trade);

        const shortTermHoldings = [];
        const longTermHoldings = [];
        for (const holding of holdings[currency]) {
            if (trade.date - holding.date >= FULL_YEAR_IN_MILLISECONDS) {
                longTermHoldings.push(holding);
            } else {
                shortTermHoldings.push(holding);
            }
        }

        const HCFOResult = getCurrencyHolding({[currency]: (longTermHoldings.length ? longTermHoldings : shortTermHoldings)}, METHOD.HCFO, trade);
        let HCFOindex = 0;
        holdings[currency].find((holding, index) => {
            if(holding === HCFOResult.holding){
                HCFOindex = index;
                return true;
            } return false;
        });

        expect(LTFOResult.startingIndex).toBe(HCFOindex);
        expect(LTFOResult.endingIndex).toBe(HCFOResult.endingIndex);
    
        expect(LTFOResult.holding).toBe(HCFOResult.holding);
    });
});
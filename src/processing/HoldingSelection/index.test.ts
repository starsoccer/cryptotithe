import { mockHoldings, mockTradesWithFiatRate } from '../../mock';
import { IHoldings, ITradeWithFiatRate, METHOD, ICurrencyHolding} from '../../types';
import holdingSelection from './';

const fiatCurrency = 'FAKE';

function calculateTotalAmount (currencyHoldings: ICurrencyHolding[]) {
    let holdingsTotal: number = 0; 
    for (const holding of currencyHoldings) {
        holdingsTotal += holding.amount;
    }
    return holdingsTotal;
}

describe('Holding Selection', () => {
    test('single holding', () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        const holdingsTotal = calculateTotalAmount(holdings[currency]);
        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        trades[0].amountSold = 1;
        trades[0].boughtCurrency = fiatCurrency;
        const result = holdingSelection(holdings, trades[0], fiatCurrency);

        expect(calculateTotalAmount(result.deductedHoldings)).toBe(trades[0].amountSold);
        expect(holdingsTotal - calculateTotalAmount(result.newHoldings[currency])).toBe(trades[0].amountSold);
    });

    test('multiple holding', () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        const holdingsTotal = calculateTotalAmount(holdings[currency]);
        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        trades[0].amountSold = holdings[currency][0].amount + 1;
        trades[0].boughtCurrency = fiatCurrency;
        const result = holdingSelection(holdings, trades[0], fiatCurrency);

        expect(calculateTotalAmount(result.deductedHoldings)).toBe(trades[0].amountSold);
        expect(holdingsTotal - calculateTotalAmount(result.newHoldings[currency])).toBe(trades[0].amountSold);
    });

    test('multiple holding overflow', () => {
        const holdings: IHoldings = mockHoldings(1, 3);
        const currency: string = Object.keys(holdings)[0];
        const holdingsTotal = calculateTotalAmount(holdings[currency]);
        const trades: ITradeWithFiatRate[] = mockTradesWithFiatRate(1, new Date('2/2/2018'), holdings, false);
        trades[0].amountSold = holdingsTotal + 1;
        trades[0].boughtCurrency = fiatCurrency;
        const result = holdingSelection(holdings, trades[0], fiatCurrency);
        expect(calculateTotalAmount(result.deductedHoldings)).toBe(trades[0].amountSold);
        expect(result.deductedHoldings[result.deductedHoldings.length - 1].amount).toBe(trades[0].amountSold - holdingsTotal);
        expect(currency in result.newHoldings).toBeFalsy();
    });
});
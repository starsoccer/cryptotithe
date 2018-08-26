import { IHoldings, IHoldingsValue, IHoldingsValueComplex } from '../../types';
import getCurrentRates from '../getCurrentRates';
import { getDayAvg } from '../getFiatRate/getDayAvgCurrencyRate';

export async function calculateHoldingsValue(
    holdings: IHoldings,
    fiatCurrency: string,
    date: Date = new Date(),
): Promise<IHoldingsValue> {
    const currencies = Object.keys(holdings);
    const holdingsValues: IHoldingsValue = {
        total: 0,
        currencies: {

        },
    };
    for (const currency of currencies) {
        let totalHeld = 0;
        const rate = getDayAvg(fiatCurrency, currency, date.getTime());
        for (const holding of holdings[currency]) {
            totalHeld += holding.amount;
        }
        holdingsValues.currencies[currency] = {
            fiatValue: await rate * totalHeld,
            amount: totalHeld,
        };
        holdingsValues.total += holdingsValues.currencies[currency].fiatValue;
    }
    return holdingsValues;
}

export async function calculateInDepthHoldingsValueCurrently(
    holdings: IHoldings,
    fiatCurrency: string,
): Promise<IHoldingsValueComplex> {
    const currencies = Object.keys(holdings);
    const result = (await getCurrentRates(currencies, fiatCurrency)).RAW;
    const holdingsValues: IHoldingsValueComplex = {
        BTCTotal: 0,
        fiatTotal: 0,
        currencies: {},
    };
    for (const currency of currencies) {
        if (currency !== fiatCurrency) {
            let totalHeld = 0;
            let totalCost = 0;
            for (const holding of holdings[currency]) {
                totalHeld += holding.amount;
                totalCost += holding.rateInFiat * holding.amount;
            }

            holdingsValues.currencies[currency] = {
                fiatValue: 0,
                BTCValue: 0,
                BTCRate: 0,
                fiatRate: 0,
                BTCChange: 0,
                fiatChange: 0,
                amount: totalHeld,
                fiatCost: totalCost,
            };
            if (currency in result) {
                const BTCValue = result[currency].BTC.PRICE * totalHeld;
                const fiatValue = result[currency][fiatCurrency].PRICE * totalHeld;
                holdingsValues.BTCTotal += BTCValue;
                holdingsValues.fiatTotal += fiatValue;
                holdingsValues.currencies[currency] = {
                    fiatValue,
                    BTCValue,
                    BTCRate: result[currency].BTC.PRICE,
                    fiatRate: result[currency][fiatCurrency].PRICE,
                    BTCChange: result[currency].BTC.CHANGEPCT24HOUR,
                    fiatChange: result[currency][fiatCurrency].CHANGEPCT24HOUR,
                    amount: totalHeld,
                    fiatCost: totalCost,
                };
            }
        }
    }
    return holdingsValues;
}

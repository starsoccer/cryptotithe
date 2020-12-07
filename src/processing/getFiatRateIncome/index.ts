import { FiatRateMethod, IIncomeWithFiatRate, IIncome } from '../../types';
import { getBTCFiatRate } from './BTCBasedRate';
import { calculateAverageFromArray, calculateAvgerageHourPrice } from '../getFiatRate/utils';
import { getClosestHourPrice } from '../getFiatRate/getClosestHourPrice';
import { getDayAvg } from '../getFiatRate/getDayAvgCurrencyRate';

export async function getFiatRate(
    income: IIncome,
    fiatCurrency: string,
    method: FiatRateMethod,
): Promise<IIncomeWithFiatRate> {
    if (income.currency === 'BTC') {
        const BTCBasedRate = await getBTCFiatRate(income, fiatCurrency, method);
        return addRatetoIncome(income, BTCBasedRate);
    } else {
        switch (method) {
            case FiatRateMethod['Double Average']: {
                const dayAvgDouble = await getDayAvg(fiatCurrency, income.currency, income.date);
                const closestHourAvg = await getClosestHourPrice(income.currency, fiatCurrency, income.date)
                return addRatetoIncome(
                    income,
                    calculateAverageFromArray([
                        dayAvgDouble,
                        calculateAvgerageHourPrice(closestHourAvg),
                    ]),
                );
            }
            case FiatRateMethod['Day Average']: {
                const dayAvg = await getDayAvg(fiatCurrency, income.currency, income.date);
                return addRatetoIncome(income, dayAvg);
            }
            case FiatRateMethod['Day Average Middle']: {
                const dayAvgMid = await getDayAvg(fiatCurrency, income.currency, income.date, 'MidHighLow');
                return addRatetoIncome(income, dayAvgMid);
            }
            case FiatRateMethod['Day Average Volume']: {
                const dayAvgVolume = await getDayAvg(fiatCurrency, income.currency, income.date, 'VolFVolT');
                return addRatetoIncome(income, dayAvgVolume);
            }
            case FiatRateMethod['Hour Low']: {
                const lowPrice = await getClosestHourPrice(income.currency, fiatCurrency, income.date);
                return addRatetoIncome(income, lowPrice.low);
            }
            case FiatRateMethod['Hour High']: {
                const highPrice = await getClosestHourPrice(income.currency, fiatCurrency, income.date);
                return addRatetoIncome(income, highPrice.high);
            }
            case FiatRateMethod['Hour Open']: {
                const openPrice = await getClosestHourPrice(income.currency, fiatCurrency, income.date);
                return addRatetoIncome(income, openPrice.open);
            }
            case FiatRateMethod['Hour Close']: {
                const closePrice = await getClosestHourPrice(income.currency, fiatCurrency, income.date);
                return addRatetoIncome(income, closePrice.close);
            }
            default: {
                const avg = await getClosestHourPrice(income.currency, fiatCurrency, income.date);
                return addRatetoIncome(income, calculateAvgerageHourPrice(avg));
            }
        }
    }
}

function addRatetoIncome(income: IIncome, rate: number): IIncomeWithFiatRate {
    return {
        ...income,
        fiatRate: rate,
    };
}

export async function addFiatRateToIncomes(
    incomes: IIncome[],
    fiatCurrency: string,
    method: FiatRateMethod = FiatRateMethod['Double Average'],
): Promise<IIncomeWithFiatRate[]> {
    const newIncomes: IIncomeWithFiatRate[]  = [];
    for (const income of incomes) {
        // cant get some rates without await maybe cryptocompare rate limiting
        newIncomes.push(await getFiatRate(income, fiatCurrency, method));
    }
    return Promise.all(newIncomes);
}

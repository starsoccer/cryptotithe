import { FiatRateMethod, IIncome } from '../../../types';
import { getClosestHourPrice } from '../../getFiatRate/getClosestHourPrice';
import { getDayAvg } from '../../getFiatRate/getDayAvgCurrencyRate';
import { calculateAverageFromArray, calculateAvgerageHourPrice } from '../../getFiatRate/utils';

export async function getBTCFiatRate(income: IIncome, fiatCurrency: string, method: FiatRateMethod) {
    switch (method) {
        case FiatRateMethod['Double Average']: {
            const dayAvg = await getDayAvg(fiatCurrency, 'BTC', income.date);
            const hourBTCData = await getClosestHourPrice('BTC', fiatCurrency, income.date);
            return calculateAverageFromArray([dayAvg, calculateAvgerageHourPrice(hourBTCData)]);
        }
        case FiatRateMethod['Day Average']: {
            return await getDayAvg(fiatCurrency, 'BTC', income.date);
        }
        case FiatRateMethod['Day Average Middle']: {
            return await getDayAvg(fiatCurrency, 'BTC', income.date, 'MidHighLow');
        }
        case FiatRateMethod['Day Average Volume']: {
            return await getDayAvg(fiatCurrency, 'BTC', income.date, 'VolFVolT');
        }
        default: {
            const hourData = await getClosestHourPrice('BTC', fiatCurrency, income.date);
            switch (method) {
                case FiatRateMethod['Hour Low']: {
                    return hourData.low;
                }
                case FiatRateMethod['Hour High']: {
                    return hourData.high;
                }
                case FiatRateMethod['Hour Open']: {
                    return hourData.open;
                }
                case FiatRateMethod['Hour Close']: {
                    return hourData.close;
                }
                default: {
                    return calculateAvgerageHourPrice(hourData);
                }
            }
        }
    }
}

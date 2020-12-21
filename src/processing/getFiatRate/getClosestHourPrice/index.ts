import got from 'got';
import { ITrade } from '../../../types';
import { IHourlyPriceData, roundHour } from '../utils';

export async function getClosestHourPrice(
    currency: string,
    fiatCurrency: string,
    date: number,
): Promise<IHourlyPriceData> {
    const tradeTime = parseInt((roundHour(new Date(date)) / 1000).toFixed(0), 10);
    const data = [
        `fsym=${currency}`,
        `tsym=${fiatCurrency}`,
        `limit=1`,
        `toTs=${tradeTime}`,
    ];
    const response: got.Response<any> = await got(
        'https://min-api.cryptocompare.com/data/histohour?' + data.join('&'),
    );
    if ('body' in response) {
        try {
            const result: any = JSON.parse(response.body);
            if ('Data' in result) {
                for (const hourData of result.Data as IHourlyPriceData[]) {
                    if (hourData.time <= tradeTime && tradeTime >= hourData.time + 3600) {
                        return hourData;
                    }
                }
            }
            throw new Error('Unknown Response Type');
        } catch (ex) {
            throw new Error('Error parsing JSON');
        }
    } else {
        throw new Error('Invalid Response');
    }
}

export async function getClosestHourPriceForTrade(trade: ITrade, fiatCurrency: string): Promise<IHourlyPriceData> {
    try {
        const result = await getClosestHourPrice(trade.soldCurrency, fiatCurrency, trade.date);
        return result;
    } catch {
        // failed to get rate try to convert from bought currency
        const rateData = await getClosestHourPrice(trade.boughtCurrency, fiatCurrency, trade.date);
        return convertToInverseRate(trade, rateData);
    }
}

const convertToInverseRate = async (trade: ITrade, rateData: IHourlyPriceData): Promise<IHourlyPriceData>  => {
    const newRateData = {...rateData};
    const rateKeys = ['low', 'high', 'open', 'close'];
    for (const key of rateKeys) {
        newRateData[key] = getInverseRate(trade, newRateData[key]);
    }

    return newRateData;
}

const getInverseRate = (trade: ITrade, rate: number) => (
    (
        trade.amountSold / trade.rate
    ) * rate / trade.amountSold
);
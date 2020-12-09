import { IHoldings } from "../../types"

export const addToHoldings = (oldHoldings: IHoldings, currency: string, amount: number, fiatRate: number, date: number, location?: string) => {
    const newHoldings = oldHoldings;
    if (currency in newHoldings === false) {
        newHoldings[currency] = [];
    }

    newHoldings[currency].push({
        amount,
        rateInFiat: fiatRate,
        date,
        location: location ?? '',
    });

    return newHoldings;
}
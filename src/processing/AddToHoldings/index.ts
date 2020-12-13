import { IHoldings } from "@types";
import clone from "clone";

export const addToHoldings = (oldHoldings: IHoldings, currency: string, amount: number, fiatRate: number, date: number, location?: string) => {
    const newHoldings = clone(oldHoldings);
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
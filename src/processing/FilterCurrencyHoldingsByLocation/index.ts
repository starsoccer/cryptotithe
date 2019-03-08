import { Location, IHoldings } from '../../types';
import * as clone from 'clone';

export default function filterCurrencyHoldingsByLocation(location: Location, holdings: IHoldings) {
    const newHoldings = clone(holdings);
    const currencies = Object.keys(newHoldings);
    for (const currency of currencies) {
        newHoldings[currency] = newHoldings[currency].filter((holding) => holding.location === location);
        if (newHoldings[currency].length === 0) {
            delete newHoldings[currency];
        }
    }
    return newHoldings;
}

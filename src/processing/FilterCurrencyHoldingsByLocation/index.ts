import clone from 'clone';
import { IHoldings, Location } from '../../types';

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

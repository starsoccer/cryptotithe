import { ICurrencyHolding, IHoldings } from '../../types';

export default function sortHoldings(holdings: IHoldings): IHoldings {
    const sortedHoldings: IHoldings = {};
    const currencies = Object.keys(holdings);
    for (const currency of currencies) {
        sortedHoldings[currency] = holdings[currency].sort(sortHoldingsByDate);
    }
    return sortedHoldings;
}

function sortHoldingsByDate(holding1: ICurrencyHolding, holding2: ICurrencyHolding): number {
    return holding1.date - holding2.date;
}

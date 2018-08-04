export * from './trade';
export * from './holding';
export * from './savedData';

export interface IDailyBalance {
    date: Date;
    holdings: {[key: string]: ISimplifiedHoldingsWithValue};
    fiatValue: number;
}

export interface ISimplifiedHoldingsWithValue {
    fiatValue: number;
    amount: number;
}

export enum METHOD {
    FIFO = 'FIFO',
    LIFO = 'LIFO',
    HCFO = 'HCFO',
    LCFO = 'LCFO',
    LTFO = 'LTFO',
    HTFO = 'HTFO',
}

export enum FiatRateMethod {
    DOUBLEAVERAGE = 'Double Average',
    HOURAVG = 'Hour Avg', // open, close, high, low averaged
    HOURHIGH = 'Hour High',
    HOURLOW= 'Hour Low',
    HOURCLOSE = 'Hour Close',
    HOUROPEN = 'Hour Open',
    DAYAVERAGE = 'Day Average',
    DAYAVERAGEMID = 'Day Average Middle',
    DAYAVERAGEVOLUME = 'Day Average Volume',
}

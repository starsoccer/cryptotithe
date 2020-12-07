export * from './trade';
export * from './holding';
export * from './savedData';
export * from './locations';
export * from './transactions';
export * from './import';
export * from './income';

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
    'Double Average' = 'DOUBLEAVERAGE',
    'Hour Avg' = 'HOURAVG',
    'Hour High' = 'HOURHIGH',
    'Hour Low' = 'HOURLOW',
    'Hour Close' = 'HOURCLOSE',
    'Hour Open' = 'HOUROPEN',
    'Day Average' = 'DAYAVERAGE',
    'Day Average Middle' = 'DAYAVERAGEMID',
    'Day Average Volume' = 'DAYAVERAGEVOLUME',
}

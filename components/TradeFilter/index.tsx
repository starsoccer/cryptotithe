import * as React from 'react';
import { EXCHANGES, ITrade } from '../../src/types';

export interface ITradeFilterOptions {
    currency: string;
    exchange: EXCHANGES | string;
}

export interface ITradeFilterProps {
    trades: ITrade[];
    options: ITradeFilterOptions;
    onChange: (options: ITradeFilterOptions) => void;
}

export function getCurrenciesByExchange(trades: ITrade[], exchange: EXCHANGES | string) {
    const exchangeTrades = (exchange === ALL_EXCHANGES ?
        trades : trades.filter((trade: ITrade) => trade.exchange === exchange)
    );
    const currencies: Set<string> = new Set();
    for (const trade of exchangeTrades) {
        currencies.add(trade.boughtCurrency);
        currencies.add(trade.soldCurrency);
    }
    return Array.from(currencies);
}

export const ALL_EXCHANGES = 'ALL';

export class TradeFilter extends React.PureComponent<ITradeFilterProps> {
    public onSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'exchange':
                this.props.onChange({
                    exchange: (e.currentTarget.value !== ALL_EXCHANGES ?
                        EXCHANGES[e.currentTarget.value] : ALL_EXCHANGES
                    ),
                    currency: getCurrenciesByExchange(this.props.trades, EXCHANGES[e.currentTarget.value])[0],
                });
                break;
            case 'currency':
                this.props.onChange({
                    exchange: this.props.options.exchange,
                    currency: e.currentTarget.value,
                });
                break;
        }
    }

    public render() {
        return (
            <div className='TradeFilter'>
                <label htmlFor='type' className='pr2'>Exchange</label>
                <select name='type' id='type' onChange={this.onSelectChange('exchange')}>
                    <option key='ALL' value='ALL'>All</option>,
                    {Object.keys(EXCHANGES).map((key) =>
                        <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                    )}
                </select>
                <br />
                <label htmlFor='type' className='pr2 pt2 pb2'>Currency</label>
                <select name='type' id='type' onChange={this.onSelectChange('currency')}>
                    {getCurrenciesByExchange(this.props.trades, this.props.options.exchange).map(
                        (currency: string) =>
                            <option key={currency} value={currency} selected={currency === this.props.options.currency}>
                                {currency}
                            </option>,
                    )}
                </select>
            </div>
        );
    }
}

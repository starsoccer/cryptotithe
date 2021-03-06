import { FormGroup, HTMLSelect, Intent } from '@blueprintjs/core';
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
    return Array.from(currencies).sort();
}

export function filterTrades<TradeType extends ITrade>(
    trades: TradeType[], exchange: EXCHANGES | string, currency: string,
): TradeType[] {
    return trades.filter((trade: TradeType) =>
        (
            ALL_EXCHANGES === exchange ||
            trade.exchange === exchange
        ) &&
        (
            ALL_CURRENCIES === currency ||
            trade.boughtCurrency === currency ||
            trade.soldCurrency === currency
        ),
    );
}

export const ALL_EXCHANGES = 'ALL';
export const ALL_CURRENCIES = 'ALL';

export class TradeFilter extends React.PureComponent<ITradeFilterProps> {
    public onSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'exchange':
                this.props.onChange({
                    exchange: (e.currentTarget.value !== ALL_EXCHANGES ?
                        e.currentTarget.value : ALL_EXCHANGES
                    ),
                    currency: ALL_CURRENCIES,
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
            <div className='trade-filter'>
                <FormGroup
                    className="flex justify-center"
                    labelFor="type"
                    label="Exchange"
                    helperText="Exchange to filter for"
                    intent={Intent.PRIMARY}
                    inline={true}
                >
                    <HTMLSelect
                        id="type"
                        name="type"
                        onChange={this.onSelectChange('exchange')}
                    >
                        <option key='ALL' value='ALL'>All</option>,
                        {Object.keys(EXCHANGES).sort().map((key) =>
                            <option key={key} value={EXCHANGES[key]}>{key}</option>,
                        )}
                    </HTMLSelect>
                </FormGroup>
                <FormGroup
                    className="mt3 flex justify-center"
                    labelFor="currency"
                    label="Currency"
                    helperText="Currency to filter for"
                    intent={Intent.PRIMARY}
                    inline={true}
                >
                    <HTMLSelect
                        id="currency"
                        name="currency"
                        onChange={this.onSelectChange('currency')}
                        value={this.props.options.currency}
                    >
                        <option key='ALL' value='ALL'>All</option>,
                        {getCurrenciesByExchange(this.props.trades, this.props.options.exchange).map(
                            (currency: string) =>
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>,
                        )}
                    </HTMLSelect>
                </FormGroup>
            </div>
        );
    }
}

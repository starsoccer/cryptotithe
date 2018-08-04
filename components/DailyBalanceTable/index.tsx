import * as React from 'react';
import {
    IDailyBalance,
} from '../../src/types';
import { Table } from '../Table';

export interface IDailyBalanceTable {
    dailyBalance: IDailyBalance[];
}

export class DailyBalanceTable extends React.Component<IDailyBalanceTable> {
    public render() {
        return (
            <Table
                headers={['Date', 'Holdings', 'Fiat Value']}
                rows={this.props.dailyBalance.map((balance) => [
                    <p>{balance.date.toUTCString()}</p>,
                    <div>{Object.keys(balance.holdings).map((currency) =>
                        <p>{`
                            ${currency} - ${balance.holdings[currency].amount} - ${balance.holdings[currency].fiatValue}
                        `}</p>,
                    )}</div>,
                    <p>{balance.fiatValue}</p>,
                ])}
            />
        );
    }
}

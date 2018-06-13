import * as React from 'react';
import { ITrade } from '../../src/types';
import { Table } from '../Table';

export interface ITradeTableProps {
    className?: string;
    trades: ITrade[];
}

export class TradesTable extends React.Component<ITradeTableProps> {
    public render() {
        return (
            <Table
                headers={['Date', 'Amount Sold', 'Sold Currency', 'Rate', 'Bought Currency']}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.amountSold}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <span>{trade.rate}</span>,
                    <span>{trade.boughtCurreny}</span>,
                ])}
            />
        );
    }
}

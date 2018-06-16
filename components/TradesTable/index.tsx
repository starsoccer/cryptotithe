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
                headers={['Date', 'ID', 'Amount Sold', 'Sold Currency', 'Rate', 'Bought Currency', 'Amount Bought']}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.id}</span>,
                    <span>{trade.amountSold.toFixed(8)}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <span>{trade.rate.toFixed(8)}</span>,
                    <span>{trade.boughtCurrency}</span>,
                    <span>{(trade.amountSold / trade.rate).toFixed(8)}</span>,
                ])}
            />
        );
    }
}

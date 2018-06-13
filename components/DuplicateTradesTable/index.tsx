import * as React from 'react';
import { ITradeWithDuplicateProbability } from '../../src/types';
import { Table } from '../Table';

export interface IDuplicateTradesTableProps {
    className?: string;
    trades: ITradeWithDuplicateProbability[];
}

export class DuplicateTradesTable extends React.Component<IDuplicateTradesTableProps> {
    public render() {
        return (
            <Table
                headers={[
                    'Date',
                    'Amount Sold',
                    'Sold Currency',
                    'Rate',
                    'Bought Currency',
                    'Duplicate Probability',
                    'Action',
                ]}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.amountSold}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <span>{trade.rate}</span>,
                    <span>{trade.boughtCurreny}</span>,
                    <span>{trade.probability}</span>,
                    <button>TEST</button>,
                ])}
            />
        );
    }
}

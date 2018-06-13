import * as React from 'react';
import { ITradeWithDuplicateProbability } from '../../src/types';
import { Table } from '../Table';
import { Toggle } from '../Toggle';

export interface IDuplicateTradesTableProps {
    className?: string;
    trades: ITradeWithDuplicateProbability[];
    duplicateChange: (tradeID: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export class DuplicateTradesTable extends React.Component<IDuplicateTradesTableProps> {
    public render() {
        return (
            <Table
                headers={[
                    'Date',
                    'ID',
                    'Amount Sold',
                    'Sold Currency',
                    'Rate',
                    'Bought Currency',
                    'Duplicate Probability',
                    'Duplicate',
                ]}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.id}</span>,
                    <span>{trade.amountSold}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <span>{trade.rate.toFixed(8)}</span>,
                    <span>{trade.boughtCurreny}</span>,
                    <span>{trade.probability}</span>,
                    <Toggle
                        onChange={this.props.duplicateChange(trade.id)}
                        defaultValue={trade.duplicate}
                    />,
                ])}
            />
        );
    }
}

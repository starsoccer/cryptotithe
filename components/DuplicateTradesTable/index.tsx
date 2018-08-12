import * as React from 'react';
import { ITradeWithDuplicateProbability } from '../../src/types';
import { Table } from '../Table';
import { Toggle } from '../Toggle';

export interface IDuplicateTradesTableProps {
    className?: string;
    trades: ITradeWithDuplicateProbability[];
    duplicateChange(tradeID: string): (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export class DuplicateTradesTable extends React.PureComponent<IDuplicateTradesTableProps> {
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
                    'Amount Bought',
                    'Duplicate Probability',
                    'Duplicate',
                ]}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.id}</span>,
                    <span>{trade.amountSold.toFixed(8)}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <div>
                        {trade.rate.toFixed(8)}<i className='fa fa-arrow-circle-right'/>
                        <br />
                        <i className='fa fa-arrow-circle-left'/>{trade.amountSold / trade.rate / trade.amountSold}
                    </div>,
                    <span>{trade.boughtCurrency}</span>,
                    <span>{(trade.amountSold / trade.rate).toFixed(8)}</span>,
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

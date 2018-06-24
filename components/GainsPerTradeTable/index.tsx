import * as React from 'react';
import { ITradeWithGains } from '../../src/types';
import { Table } from '../Table';

export interface IGainsPerTradeTableProps {
    className?: string;
    trades: ITradeWithGains[];
}

export class GainsPerTradeTable extends React.Component<IGainsPerTradeTableProps> {
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
                    'USD Rate',
                    'USD Value',
                    'Short Term Gain',
                    'Long Term Gain',
                ]}
                rows={this.props.trades.map((trade) => [
                    <span>{new Date(trade.date).toUTCString()}</span>,
                    <span>{trade.id}</span>,
                    <span>{trade.amountSold.toFixed(8)}</span>,
                    <span>{trade.soldCurrency}</span>,
                    <span>{trade.rate.toFixed(8)}</span>,
                    <span>{trade.boughtCurrency}</span>,
                    <span>{(trade.amountSold / trade.rate).toFixed(8)}</span>,
                    <span>{trade.USDRate.toFixed(8)}</span>,
                    <span>{(trade.amountSold * trade.USDRate).toFixed(8)}</span>,
                    <span>{trade.shortTerm.toFixed(2)}</span>,
                    <span>{trade.longTerm.toFixed(2)}</span>,
                ])}
            />
        );
    }
}

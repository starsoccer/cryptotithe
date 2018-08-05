import * as React from 'react';
import { IHoldingsValue } from '../../src/types';
import { Table } from '../Table';

export interface IPortfolioTableProps {
    className?: string;
    holdingsValue: IHoldingsValue;
}

export class PortfolioTable extends React.Component<IPortfolioTableProps> {

    public render() {
        return (
            <Table
                headers={[
                    'Currency',
                    'Amount',
                    'Rate',
                    'Value',
                ]}
                rows={Object.keys(this.props.holdingsValue.currencies).map((currency) => [
                    <span>{currency}</span>,
                    <span>{this.props.holdingsValue.currencies[currency].amount}</span>,
                    <span>{
                        this.props.holdingsValue.currencies[currency].fiatValue /
                        this.props.holdingsValue.currencies[currency].amount
                    }</span>,
                    <span>{this.props.holdingsValue.currencies[currency].fiatValue}</span>
                ])}
            />
        );
    }
}

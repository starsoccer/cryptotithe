import * as React from 'react';
import { IHoldingsValueComplex } from '../../src/types';
import { Table } from '../Table';

export interface IPortfolioTableProps {
    className?: string;
    holdingsValue: IHoldingsValueComplex;
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
                    <div>
                        <span>
                            BTC {this.props.holdingsValue.currencies[currency].BTCRate} {this.props.holdingsValue.currencies[currency].BTCChange}
                        </span>
                        <br />
                        <span>
                            {this.props.holdingsValue.currencies[currency].fiatRate} {this.props.holdingsValue.currencies[currency].fiatChange}
                        </span>
                    </div>,
                    <div>
                        <span>{this.props.holdingsValue.currencies[currency].BTCValue}</span>
                        <br />
                        <span>{this.props.holdingsValue.currencies[currency].fiatValue}</span>
                    </div>,
                ])}
            />
        );
    }
}

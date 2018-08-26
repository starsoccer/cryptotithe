import * as React from 'react';
import { IHoldingsValueComplex } from '../../src/types';
import { Table } from '../Table';

export interface IPortfolioTableProps {
    className?: string;
    holdingsValue: IHoldingsValueComplex;
    fiatCurrency: string;
}

function makeColorFul(amount: number) {
    if (amount === 0) {
        return '';
    }
    if (Math.abs(amount) === amount) {
        return 'green';
    } else {
        return 'red';
    }
}

export class PortfolioTable extends React.PureComponent<IPortfolioTableProps> {

    public render() {
        return (
            <Table
                headers={[
                    'Currency',
                    'Amount',
                    'Cost',
                    'Rate',
                    'Value',
                    'Fiat Gain',
                ]}
                rows={Object.keys(this.props.holdingsValue.currencies).map((currency) => [
                    <span>{currency}</span>,
                    <span>{this.props.holdingsValue.currencies[currency].amount.toFixed(8)}</span>,
                    <div>
                        {this.props.holdingsValue.currencies[currency].fiatCost.toFixed(2)}
                    </div>,
                    <div>
                        <p className={
                            makeColorFul(this.props.holdingsValue.currencies[currency].BTCChange)
                        }>
                            <span className='ph1'>
                                {this.props.holdingsValue.currencies[currency].BTCRate.toFixed(8)}
                            </span>
                            <span className='ph1'>
                                ({this.props.holdingsValue.currencies[currency].BTCChange.toFixed(2)}%)
                            </span>
                            <span className='pl1'>BTC</span>
                        </p>
                        <hr />
                        <p className={
                            makeColorFul(this.props.holdingsValue.currencies[currency].fiatChange)
                        }>
                            <span className='ph1'>{
                                this.props.holdingsValue.currencies[currency].fiatRate.toFixed(2)
                            }</span>
                            <span className='ph1'>
                                ({this.props.holdingsValue.currencies[currency].fiatChange.toFixed(2)}%)
                            </span>
                            <span className='ph1'>{this.props.fiatCurrency}</span>
                        </p>
                    </div>,
                    <div>
                        <p>
                            {this.props.holdingsValue.currencies[currency].BTCValue.toFixed(8)}
                            <span className='pl1'>BTC</span>
                        </p>
                        <hr />
                        <p>
                            {this.props.holdingsValue.currencies[currency].fiatValue.toFixed(2)}
                            <span className='pl2'>{this.props.fiatCurrency}</span>
                        </p>
                    </div>,
                    <div>
                        {(this.props.holdingsValue.currencies[currency].fiatValue - this.props.holdingsValue.currencies[currency].fiatCost).toFixed(2)}
                    </div>,
                ])}
            />
        );
    }
}

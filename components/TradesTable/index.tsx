import * as React from 'react';
import { ITradeWithUSDRate } from '../../src/types';

export interface ITradeTableProps {
    className?: string;
    trades: ITradeWithUSDRate[];
}

export class TradesTable extends React.Component<ITradeTableProps> {
    public render() {
        return (
            <div className='tradesTable pa4'>
                <div className='overflow-auto'>
                    <table className='f6 w-100 mw8 center'>
                        <thead>
                            <tr className='stripe-dark'>
                                <th className='fw6 tl pa3 bg-white'>Date</th>
                                <th className='fw6 tl pa3 bg-white'>Amount Sold</th>
                                <th className='fw6 tl pa3 bg-white'>Sold Currency</th>
                                <th className='fw6 tl pa3 bg-white'>Rate</th>
                                <th className='fw6 tl pa3 bg-white'>Bought Currency</th>
                                <th className='fw6 tl pa3 bg-white'>USD Rate</th>
                            </tr>
                        </thead>
                        <tbody className='lh-copy'>{
                            this.props.trades.map((trade) =>
                                <tr className='stripe-dark' key={`${trade.exchange}-${trade.id}`}>
                                    <td className='pa3'>{trade.date.toUTCString()}</td>
                                    <td className='pa3'>{trade.amountSold}</td>
                                    <td className='pa3'>{trade.soldCurrency}</td>
                                    <td className='pa3'>{trade.rate}</td>
                                    <td className='pa3'>{trade.boughtCurreny}</td>
                                    <td className='pa3'>{trade.USDRate}</td>
                                </tr>,
                        )}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

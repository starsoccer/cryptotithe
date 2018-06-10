import * as React from 'react';
import { ITrade } from '../../src/types';

export interface ITradeTableProps {
    className?: string;
    trades: ITrade[];
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
                                <th className='fw6 tl pa3 bg-white'>Bought Currency</th>
                                <th className='fw6 tl pa3 bg-white'>Rate</th>
                                <th className='fw6 tl pa3 bg-white'>Sold Currency</th>
                            </tr>
                        </thead>
                        <tbody className='lh-copy'>{
                            this.props.trades.map((trade) =>
                                <tr className='stripe-dark' key={trade.date.toString()}>
                                    <td className='pa3'>{trade.date.toString()}</td>
                                    <td className='pa3'>{trade.amountSold}</td>
                                    <td className='pa3'>{trade.boughtCurreny}</td>
                                    <td className='pa3'>{trade.rate}</td>
                                    <td className='pa3'>{trade.soldCurrency}</td>
                                </tr>,
                        )}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

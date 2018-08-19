import * as React from 'react';
import { ITrade } from '../../src/types';
export interface ITimelineProp {
    trades: ITrade[]
}

export class Timeline extends React.PureComponent<ITimelineProp> {
    public render() {
        return (
            <div className='timeline relative center'>
                <link rel='stylesheet' type='text/css' href='./components/Timeline/index.css' />
                {this.props.trades.map((trade, index) =>
                    <div className={`container ${index % 2 === 0 ? 'left' : 'right'}`} key={trade.ID}>
                        <div className='pv2 ph3 bg-white relative br2'>
                            <h2>Sold {trade.amountSold.toFixed(8)} {trade.soldCurrency}</h2>
                            <h4>Got {(trade.amountSold / trade.rate).toFixed(8)} {trade.boughtCurrency}</h4>
                            <p>{trade.rate.toFixed(8)} rate on {trade.exchange || 'Unknown'}</p>
                            <h6>{new Date(trade.date).toUTCString()}</h6>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

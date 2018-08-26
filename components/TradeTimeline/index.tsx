import * as React from 'react';
import * as InfiniteScroll from 'react-infinite-scroller';
import { ITrade } from '../../src/types';
import { Loader } from '../Loader';

export interface ITradeTimelineProp {
    trades: ITrade[];
}

export interface ITradeTimelineState {
    page: number;
}

const tradesPerPage =  100;

export default class TradeTimeline extends React.Component<ITradeTimelineProp, ITradeTimelineState> {
    public constructor(props: ITradeTimelineProp) {
        super(props);
        this.state = {
            page: 0,
        };
    }

    public moreTrades = (page: number) => {
        this.setState({
            page,
        });
    }

    public render() {
        return (
            <div className='trade-timeline relative center'>
            <link rel='stylesheet' type='text/css' href='./components/TradeTimeline/index.css' />
                <InfiniteScroll
                    pageStart={this.state.page}
                    loadMore={this.moreTrades}
                    hasMore={this.state.page * tradesPerPage <= this.props.trades.length}
                    loader={<Loader key={this.state.page}/>}
                >
                    {this.props.trades.slice(0, this.state.page * tradesPerPage).map((trade, index) =>
                        <div className={`container ${index % 2 === 0 ? 'left' : 'right'}`} key={trade.ID}>
                            <div className='pv2 ph3 bg-white relative br2'>
                                <h2>Sold {trade.amountSold.toFixed(8)} {trade.soldCurrency}</h2>
                                <h4>Got {(trade.amountSold / trade.rate).toFixed(8)} {trade.boughtCurrency}</h4>
                                <p>{trade.rate.toFixed(8)} rate on {trade.exchange || 'Unknown'}</p>
                                <h6>{new Date(trade.date).toUTCString()}</h6>
                            </div>
                        </div>,
                    )}
                </InfiniteScroll>
            </div>
        );
    }
}

import * as React from 'react';
import * as InfiniteScroll from 'react-infinite-scroller';
import { calculateGains } from '../../src/processing/CalculateGains';
import { IHoldings, ITradeWithFiatRate, METHOD } from '../../src/types';
import { Loader } from '../Loader';

export interface ITradeTimelineProp {
    trades: ITradeWithFiatRate[];
    fiatCurrency: string;
    gainCalculationMethod: METHOD;
}

export interface ITradeTimelineState {
    page: number;
}

const tradesPerPage =  100;

const getCurrencyHolding = (holdings: IHoldings, currency: string) => {
    let totalHoldings = 0;
    if (currency in holdings) {
        for (const holding of holdings[currency]) {
            totalHoldings += holding.amount;
        }
    }
    return totalHoldings;
};

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

    public createTimeLine = () => {
        let holdings = calculateGains(
            {},
            this.props.trades.slice(this.state.page * tradesPerPage),
            this.props.fiatCurrency,
            this.props.gainCalculationMethod,
        ).newHoldings;
        const trades = Array.from(this.props.trades);
        return trades.reverse().slice(0, this.state.page * tradesPerPage).map((trade, index) => {
            holdings = calculateGains(
                holdings,
                [trade],
                this.props.fiatCurrency,
                this.props.gainCalculationMethod,
            ).newHoldings;
            return <div className={`container ${index % 2 === 0 ? 'left' : 'right'}`} key={trade.ID}>
                <div className='pv2 ph3 bg-white relative br2'>
                    <h2>Sold {trade.amountSold.toFixed(8)} {trade.soldCurrency}</h2>
                    <h4>Got {(trade.amountSold / trade.rate).toFixed(8)} {trade.boughtCurrency}</h4>
                    <p>{trade.rate.toFixed(8)} rate on {trade.exchange || 'Unknown'}</p>
                    <p>
                        New Holdings:<br/>
                        <span className='pr2'>
                            {trade.boughtCurrency}: {getCurrencyHolding(holdings, trade.boughtCurrency)
                        }</span><br />
                        <span className='pr2'>
                            {trade.soldCurrency}: {getCurrencyHolding(holdings, trade.soldCurrency)}
                        </span>
                    </p>
                    <h6>{new Date(trade.date).toUTCString()}</h6>
                </div>
            </div>;
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
                    {this.createTimeLine()}
                </InfiniteScroll>
            </div>
        );
    }
}

import { Card, Elevation, Spinner } from '@blueprintjs/core';
import clone from 'clone';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { calculateGains } from '../../src/processing/CalculateGains';
import { EXCHANGES, IHoldings, ISavedData, ITradeWithFiatRate, METHOD, IIncomeWithFiatRate } from '../../src/types';
import keyByValue from '../../src/utils/keyByValue';
import classnames from 'classnames';
import classes from './TradeTimeline.module.scss';

export interface ITradeTimelineProp {
    trades: ITradeWithFiatRate[];
    fiatCurrency: string;
    gainCalculationMethod: METHOD;
    savedData: ISavedData;
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
        let holdings = {};
        let trades =  Array.from(this.props.trades);
        const maxPages = Math.ceil(this.props.trades.length / tradesPerPage);
        if (maxPages > this.state.page + 1) {
            const trade = this.props.trades.slice(0,
                this.props.trades.length - (this.state.page + 1) * tradesPerPage,
            );
            holdings = calculateGains(
                {},
                trade,
                this.props.savedData.incomes,
                this.props.fiatCurrency,
                this.props.gainCalculationMethod,
            ).newHoldings;
        }

        if (maxPages > this.state.page) {
            trades = trades.slice(this.props.trades.length - this.state.page * tradesPerPage);
        }

        const incomes = clone(this.props.savedData.incomes);
        return (trades.map((trade, index) => {
            const incomesToApply: IIncomeWithFiatRate[] = [];
            while (incomes.length && trade.date > incomes[0].date) {
                incomesToApply.push(incomes.shift() as IIncomeWithFiatRate);
            }

            holdings = calculateGains(
                holdings,
                [trade],
                incomesToApply, // probably should use real incomes here
                this.props.fiatCurrency,
                this.props.gainCalculationMethod,
            ).newHoldings;
            return <div
                className={classnames({
                    [classes.leftTimelineItem]: index % 2 === 0,
                    [classes.rightTimelineItem]: index % 2 !== 0
                })}
                key={trade.ID}
            >
                <Card elevation={Elevation.FOUR}>
                <h2>Sold {trade.amountSold.toFixed(8)} {trade.soldCurrency}</h2>
                    <h4>Got {(trade.amountSold / trade.rate).toFixed(8)} {trade.boughtCurrency}</h4>
                    <p>{trade.rate.toFixed(8)} rate on {
                        keyByValue(trade.exchange, EXCHANGES) || (
                            trade.exchange && trade.exchange !== '' ? trade.exchange : 'Unknown'
                        )}
                    </p>
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
                </Card>
            </div>;
        })).reverse();
    }

    public render() {
        return (
            <div className={classnames('tradeTimeline relative center', classes.tradeTimeline)}>
                <InfiniteScroll
                    pageStart={this.state.page}
                    loadMore={this.moreTrades}
                    hasMore={this.state.page * tradesPerPage <= this.props.trades.length}
                    loader={<Spinner key={this.state.page}/>}
                >
                    {this.createTimeLine()}
                </InfiniteScroll>
            </div>
        );
    }
}

import { Spinner } from '@blueprintjs/core';
import clone from 'clone';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { calculateGains } from '../../src/processing/CalculateGains';
import { ISavedData, ITradeWithFiatRate, METHOD, IIncomeWithFiatRate } from '../../src/types';
import classnames from 'classnames';
import classes from './TradeTimeline.module.scss';
import { TimelineItem } from './TimelineItem';

export interface ITradeTimelineProp {
    trades: ITradeWithFiatRate[];
    fiatCurrency: string;
    gainCalculationMethod: METHOD;
    savedData: ISavedData;
    defaultExpanded: boolean;
}

export interface ITradeTimelineState {
    page: number;
}

const tradesPerPage =  50;

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
            return (
                <TimelineItem
                    left={index % 2 === 0}
                    trade={trade}
                    holdings={holdings}
                    defaultExpanded={this.props.defaultExpanded}
                />
            );
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

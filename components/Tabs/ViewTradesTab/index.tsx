import * as React from 'react';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import sortTrades from '../../../src/processing/SortTrades';
import { FiatRateMethod, IPartialSavedData, ISavedData, ITrade, ITradeWithFiatRate } from '../../../src/types';
import Button from '../../Button';
import { Loader } from '../../Loader';
import { TradesTable } from '../../TradesTable';
import TradeTimeline from '../../TradeTimeline';
import { TradeFilter, ITradeFilterOptions, ALL_EXCHANGES, getCurrenciesByExchange } from '../../TradeFilter';

export interface IViewTradesTabProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

export interface IViewTradesTabState {
    processing: boolean;
    tradeTable: boolean;
    options: ITradeFilterOptions;
    trades: ITrade[];
}

export class ViewTradesTab extends React.Component<IViewTradesTabProp, IViewTradesTabState> {

    public constructor(props: IViewTradesTabProp) {
        super(props);
        this.state = {
            processing: false,
            tradeTable: false,
            trades: props.savedData.trades,
            options: {
                exchange: ALL_EXCHANGES,
                currency: getCurrenciesByExchange(props.savedData.trades, ALL_EXCHANGES)[0],
            },
        };
    }

    public save = (trades: ITrade[] | ITradeWithFiatRate[]) =>
        this.props.save({trades: trades as ITradeWithFiatRate[]})

    public refetchFiatRate = async () => {
        this.setState({processing: true});
        const newTrades: ITradeWithFiatRate[] = await addFiatRateToTrades(
            this.props.savedData.trades,
            this.props.savedData.settings.fiatCurrency,
            FiatRateMethod[this.props.savedData.settings.fiatRateMethod],
        );
        const sortedTrades: ITradeWithFiatRate[] = sortTrades(newTrades) as ITradeWithFiatRate[];
        this.props.save({trades: sortedTrades});
        this.setState({processing: false});
    }

    public tradeTable = () => {
        this.setState({
            tradeTable: !this.state.tradeTable,
        });
    }

    public onChange = (options: ITradeFilterOptions) => {
        this.setState({ options });
    }

    public filterTrades = () => {
        this.setState({
            processing: true,
        });
        const filteredTrades = this.props.savedData.trades.filter((trade) => 
            (this.state.options.exchange === ALL_EXCHANGES || trade.exchange === this.state.options.exchange) &&
            (trade.boughtCurrency === this.state.options.currency || trade.soldCurrency === this.state.options.currency)
        );
        this.setState({
            trades: filteredTrades,
            processing: false,
        });
    }

    public clearFilter = () => {
        this.setState({
            trades: this.props.savedData.trades,
            options: {
                exchange: ALL_EXCHANGES,
                currency: getCurrenciesByExchange(this.props.savedData.trades, ALL_EXCHANGES)[0],
            },
        });
    }

    public render() {
        return (
            <div className='viewTrades'>
                <h3 className='tc'>Trades</h3>
                <hr className='center w-50' />
                <div className='tc center pb2'>
                    <Button label='Refresh Trade Data' onClick={this.refetchFiatRate}/>
                    <Button label='Trade Table' onClick={this.tradeTable}/>
                </div>
                <hr className="w-50"/>
                <div className="tc center">
                    <TradeFilter
                        trades={this.props.savedData.trades}
                        options={this.state.options}
                        onChange={this.onChange}
                    />
                    <br />
                    <Button label="Filter Trades" onClick={this.filterTrades}/>
                    <Button label="Reset Filter" onClick={this.clearFilter}/>
                </div>
                <hr className="w-50"/>
                <div className='tc center'>
                    {this.state.processing ?
                        <Loader />
                    :
                        this.state.tradeTable ?
                            this.state.trades.length > 0 ?
                                <TradesTable
                                    trades={this.state.trades}
                                    save={this.save}
                                />
                            :
                                <h3 className='tc'>No Trades <i className='fa fa-frown-o'></i></h3>
                        :
                            <TradeTimeline trades={this.state.trades.slice(0).reverse()}/> // make this a clone or something
                    }
                </div>
            </div>
        );
    }
}

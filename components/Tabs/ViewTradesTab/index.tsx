import * as React from 'react';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import sortTrades from '../../../src/processing/SortTrades';
import { FiatRateMethod, IPartialSavedData, ISavedData, ITrade, ITradeWithFiatRate } from '../../../src/types';
import Button from '../../Button';
import { Loader } from '../../Loader';
import { ALL_CURRENCIES, ALL_EXCHANGES, filterTrades, ITradeFilterOptions, TradeFilter } from '../../TradeFilter';
import { TradesTable } from '../../TradesTable';
import TradeTimeline from '../../TradeTimeline';

export interface IViewTradesTabProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

export interface IViewTradesTabState {
    processing: boolean;
    tradeTable: boolean;
    options: ITradeFilterOptions;
}

export class ViewTradesTab extends React.Component<IViewTradesTabProp, IViewTradesTabState> {

    public constructor(props: IViewTradesTabProp) {
        super(props);
        this.state = {
            processing: false,
            tradeTable: false,
            options: {
                exchange: ALL_EXCHANGES,
                currency: ALL_CURRENCIES,
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

    public clearFilter = () => {
        this.setState({
            options: {
                exchange: ALL_EXCHANGES,
                currency: ALL_CURRENCIES,
            },
        });
    }

    public render() {
        const filteredTrades = filterTrades(
            this.props.savedData.trades, this.state.options.exchange, this.state.options.currency,
        );

        return (
            <div className='viewTrades'>
                <h3 className='tc'>Trades</h3>
                <hr className='center w-50' />
                <div className='tc center pb2'>
                    <Button label='Refresh Trade Data' onClick={this.refetchFiatRate}/>
                    <Button
                        label={this.state.tradeTable ? 'Trade Timeline' : 'Trade Table'}
                        onClick={this.tradeTable}
                    />
                </div>
                <hr className='w-50'/>
                <div className='tc center'>
                    <TradeFilter
                        trades={this.props.savedData.trades}
                        options={this.state.options}
                        onChange={this.onChange}
                    />
                    <br />
                    <Button label='Reset Filter' onClick={this.clearFilter}/>
                </div>
                <hr className='w-50'/>
                <div className='tc center'>
                    {this.state.processing ?
                        <Loader />
                    :
                        this.state.tradeTable ?
                            filteredTrades.length > 0 ?
                                <TradesTable
                                    trades={filteredTrades}
                                    save={this.save}
                                />
                            :
                                <h3 className='tc'>No Trades <i className='fa fa-frown-o'></i></h3>
                        :
                            <TradeTimeline
                                trades={filteredTrades}
                                fiatCurrency={this.props.savedData.settings.fiatCurrency}
                                gainCalculationMethod={this.props.savedData.settings.gainCalculationMethod}
                            /> // make this a clone or something
                    }
                </div>
            </div>
        );
    }
}

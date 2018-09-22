import * as React from 'react';
import { IPartialSavedData, ISavedData } from '../../../../../src/types';
import Button from '../../../../Button';
import { Loader } from '../../../../Loader';
import { ALL_EXCHANGES, getCurrenciesByExchange, ITradeFilterOptions, TradeFilter } from '../../../../TradeFilter';

export interface ICurrencyRenameProp {
    savedData: ISavedData;
    save: (data: IPartialSavedData) => Promise<boolean>;
}

interface ICurrencyRenameState {
    loading: boolean;
    options: ITradeFilterOptions;
    newCurrency: string;
    changesMade: number;
}

export default class CurrencyRename extends React.Component<ICurrencyRenameProp, ICurrencyRenameState> {
    public constructor(props: ICurrencyRenameProp) {
        super(props);
        this.state = {
            loading: false,
            changesMade: 0,
            options: {
                exchange: ALL_EXCHANGES,
                currency:  getCurrenciesByExchange(this.props.savedData.trades, ALL_EXCHANGES)[0],
            },
            newCurrency: '',
        };
    }

    public onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newCurrency: e.currentTarget.value});
    }

    public onOptionsChange = (options: ITradeFilterOptions) => {
        this.setState({options});
    }

    public rename = () => {
        this.setState({loading: true});
        const trades = this.props.savedData.trades;
        let hits = 0;
        for (const trade of trades) {
            if (
                this.state.options.exchange === ALL_EXCHANGES ||
                trade.exchange === this.state.options.exchange
            ) {
                if (trade.boughtCurrency === this.state.options.currency) {
                    trade.boughtCurrency = this.state.newCurrency;
                    hits++;
                } else if (trade.soldCurrency === this.state.options.currency) {
                    trade.soldCurrency = this.state.newCurrency;
                    hits++;
                }
            }
        }
        this.props.save({
            trades,
        });
        this.setState({
            loading: false,
            changesMade: hits,
        });
    }

    public render() {
        return (
            <div className='CurrencyRename'>
                <div className='center tc mt2'>
                    <TradeFilter
                        trades={this.props.savedData.trades}
                        onChange={this.onOptionsChange}
                        options={this.state.options}
                    />
                    <br />
                    <label htmlFor='type' className='pr2 pt2 pb2'>New Currency Name</label>
                    <input onChange={this.onChange}/>
                    <hr className='w-50' />
                    <Button label='Rename' onClick={this.rename}/>
                    {this.state.newCurrency !== '' && this.state.changesMade > 0 &&
                        <h5>{this.state.changesMade} changes made</h5>
                    }
                    {this.state.loading &&
                        <Loader />
                    }
                </div>
                {this.state.loading &&
                    <Loader />
                }
            </div>
        );
    }
}

import * as React from 'react';
import { EXCHANGES, ISavedData, ITrade, IPartialSavedData } from '../../../../../src/types';
import Button from '../../../../Button';
import { Loader } from '../../../../Loader';
export interface ICurrencyRenameProp {
    savedData: ISavedData;
    save: (data: IPartialSavedData) => Promise<Boolean>;
}

interface ICurrencyRenameState {
    exchange: EXCHANGES | string;
    loading: boolean;
    currency: string;
    newCurrency: string;
    changesMade: number;
}

function getCurrenciesByExchange(trades: ITrade[], exchange: EXCHANGES | string) {
    const exchangeTrades = (exchange === ALL_EXCHANGES ? trades : trades.filter((trade: ITrade) => trade.exchange === exchange));
    const currencies: Set<string> = new Set;
    for (const trade of exchangeTrades) {
        currencies.add(trade.boughtCurrency);
        currencies.add(trade.soldCurrency);
    }
    return Array.from(currencies);
}

const ALL_EXCHANGES = 'ALL';

export default class CurrencyRename extends React.Component<ICurrencyRenameProp, ICurrencyRenameState> {
    public constructor(props: ICurrencyRenameProp) {
        super(props);
        this.state = {
            loading: false,
            changesMade: 0,
            exchange: ALL_EXCHANGES,
            currency:  getCurrenciesByExchange(this.props.savedData.trades, ALL_EXCHANGES)[0],
            newCurrency: '',
        };
    }

    public onSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'exchange':
                this.setState({
                    exchange: (e.currentTarget.value !== ALL_EXCHANGES ? EXCHANGES[e.currentTarget.value] : ALL_EXCHANGES),
                    currency: getCurrenciesByExchange(this.props.savedData.trades, EXCHANGES[e.currentTarget.value])[0],
                });
            break;
            case 'currency':
                this.setState({currency: e.currentTarget.value});
            break;
        }
    }

    public onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({newCurrency: e.currentTarget.value});
    }

    public rename = () => {
        this.setState({loading: true});
        const trades = this.props.savedData.trades;
        let hits = 0;
        for (const trade of trades) {
            if (trade.exchange === this.state.exchange) {
                if (trade.boughtCurrency === this.state.currency) {
                    trade.boughtCurrency = this.state.newCurrency;
                    hits++;
                } else if (trade.soldCurrency === this.state.currency) {
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
            <div className='DailyBalance'>
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Exchange</label>
                    <select name='type' id='type' onChange={this.onSelectChange('exchange')}>
                        <option key="ALL" value="ALL">All</option>,
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                    <br />
                    <label htmlFor='type' className='pr2 pt2 pb2'>Currency To Rename</label>
                    <select name='type' id='type' onChange={this.onSelectChange('currency')}>
                        {getCurrenciesByExchange(this.props.savedData.trades, this.state.exchange).map((currency: string) => 
                            <option key={currency} value={currency} selected={currency === this.state.currency}>{currency}</option>,
                        )}
                    </select>
                    <br />
                    <label htmlFor='type' className='pr2 pt2 pb2'>New Currency Name</label>
                    <input onChange={this.onChange}/>
                    <hr className="w-50" />
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

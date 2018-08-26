import * as React from 'react';
import { calculateDailyBalance } from '../../../../../src/processing/CalculateDailyBalance';
import { EXCHANGES, IDailyBalance, ISavedData } from '../../../../../src/types';
import Button from '../../../../Button';
import { DailyBalanceTable } from './DailyBalanceTable';
import { Loader } from '../../../../Loader';
export interface IDailyBalanceProp {
    savedData: ISavedData;
}

interface IDailyBalanceState {
    dailyBalance?: IDailyBalance[];
    exchange: EXCHANGES;
    loading: boolean;
}

export default class DailyBalance extends React.Component<IDailyBalanceProp, IDailyBalanceState> {
    public constructor(props: IDailyBalanceProp) {
        super(props);
        this.state = {
            loading: false,
            exchange: EXCHANGES[Object.keys(EXCHANGES)[0]],
        };
    }

    public onExchangeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({exchange: EXCHANGES[e.currentTarget.value]});
    }

    public calculateDailyBalance = async () => {
        this.setState({loading: true});
        const trades = this.props.savedData.trades.filter((trade) => trade.exchange === this.state.exchange);
        this.setState({
            dailyBalance: await calculateDailyBalance(trades, this.props.savedData.settings.fiatCurrency),
            loading: false,
        });
    }

    public render() {
        return (
            <div className='DailyBalance'>
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Exchange</label>
                    <select name='type' id='type' onChange={this.onExchangeChange}>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                    <br />
                    <Button label='Calculate Daily Balance' onClick={this.calculateDailyBalance}/>
                </div>
                {this.state.loading &&
                    <Loader />
                }
                { this.state.dailyBalance !== undefined &&
                    <DailyBalanceTable dailyBalance={this.state.dailyBalance}/>
                }
            </div>
        );
    }
}

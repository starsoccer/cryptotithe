import * as React from 'react';
import { calculateDailyBalance } from '../../../../../src/processing/CalculateDailyBalance';
import { EXCHANGES, IDailyBalance, ISavedData } from '../../../../../src/types';
import getTradeYears from '../../../../../src/utils/getTradeYears';
import Button from '../../../../Button';
import { Loader } from '../../../../Loader';
import { DailyBalanceTable } from './DailyBalanceTable';
export interface IDailyBalanceProp {
    savedData: ISavedData;
}

interface IDailyBalanceState {
    dailyBalance?: IDailyBalance[];
    exchange: EXCHANGES;
    year: number;
    daysLeft: number;
    totalDays: number;
}

export default class DailyBalance extends React.Component<IDailyBalanceProp, IDailyBalanceState> {
    public constructor(props: IDailyBalanceProp) {
        super(props);
        this.state = {
            exchange: EXCHANGES[Object.keys(EXCHANGES)[0]],
            year: 0,
            daysLeft: 0,
            totalDays: 0,
        };
    }

    public onExchangeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({exchange: e.currentTarget.value as EXCHANGES});
    }

    public onYearChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({year: parseInt(e.currentTarget.value, 10)});
    }

    public calculateDailyBalance = async () => {
        const trades = this.props.savedData.trades.filter((trade) =>
            trade.exchange === this.state.exchange &&
            new Date(trade.date).getFullYear() === this.state.year,
        );
        this.setState({
            totalDays: Math.abs((new Date(trades[0].date).getTime() - new Date().getTime()) / 86400000),
        });
        const dailyBalance = await calculateDailyBalance(
            trades,
            this.props.savedData.settings.fiatCurrency,
            (daysLeft: number) => this.setState({daysLeft}),
        );
        this.setState({
            dailyBalance,
            totalDays: 0,
            daysLeft: 0,
        });
    }

    public render() {
        return (
            <div className='DailyBalance'>
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Exchange</label>
                    <select name='type' id='type' onChange={this.onExchangeChange}>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={EXCHANGES[key]}>{key}</option>,
                        )}
                    </select>
                    <br />
                    <label htmlFor='year' className='pr2'>Starting Year</label>
                    <select name='year' id='year' onChange={this.onYearChange}>
                        {getTradeYears(
                            this.props.savedData.trades.filter((trade) => trade.exchange === this.state.exchange,
                        )).map((year) =>
                            <option key={year} value={year}>{year}</option>,
                        )}
                    </select>
                    <br />
                    <Button label='Calculate Daily Balance' onClick={this.calculateDailyBalance}/>
                </div>
                {this.state.totalDays > 0 &&
                    <div className='tc pt2'>
                        Loading {(this.state.totalDays - this.state.daysLeft).toFixed(0)}
                         of {this.state.totalDays.toFixed(0)}
                        <Loader />
                    </div>
                }
                { this.state.dailyBalance !== undefined &&
                    <DailyBalanceTable dailyBalance={this.state.dailyBalance}/>
                }
            </div>
        );
    }
}

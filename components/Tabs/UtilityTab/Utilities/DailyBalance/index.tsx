import { Button, Intent, Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { calculateDailyBalance } from '../../../../../src/processing/CalculateDailyBalance';
import { EXCHANGES, IDailyBalance, ISavedData } from '../../../../../src/types';
import getYears from '../../../../../src/utils/getYears';
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
        const dailyBalance = await calculateDailyBalance(
            this.props.savedData,
            this.state.year,
            this.state.exchange,
            (totalDays: number, daysLeft: number) => this.setState({totalDays, daysLeft}),
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
                        {getYears(
                            this.props.savedData.trades.filter((trade) => trade.exchange === this.state.exchange,
                        )).map((year) =>
                            <option key={year} value={year}>{year}</option>,
                        )}
                    </select>
                    <br />
                    <Button
                        className="mt2"
                        icon="exchange"
                        intent={Intent.PRIMARY}
                        onClick={this.calculateDailyBalance}
                    >
                        Calculate Daily Balance
                    </Button>
                </div>
                {this.state.totalDays > 0 &&
                    <div className='tc pt2'>
                        {`Loading ${(this.state.totalDays - this.state.daysLeft).toFixed(0)} of `}
                        {this.state.totalDays.toFixed(0)}
                        <Spinner />
                    </div>
                }
                { this.state.dailyBalance !== undefined &&
                    <div>
                        <h3 className='tc'>{
                            Math.max(...this.state.dailyBalance.map((balance) => balance.fiatValue)).toFixed(2)
                        }</h3>
                        <DailyBalanceTable dailyBalance={this.state.dailyBalance}/>
                    </div>
                }
            </div>
        );
    }
}

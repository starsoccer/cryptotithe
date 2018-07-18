import * as React from 'react';
import { calculateDailyBalance } from '../../src/processing/CalculateDailyBalance';
import { ISavedData, EXCHANGES, IDailyBalance } from '../../src/types';
import Button from '../Button';
import { DailyBalanceTable } from '../DailyBalanceTable';
export interface IAdvancedTabProp {
    savedData: ISavedData;
}

interface IAdvancedTabState {
    dailyBalance?: IDailyBalance[],
    exchange: EXCHANGES;
}

export class AdvancedTab extends React.Component<IAdvancedTabProp, IAdvancedTabState> {
    public constructor(props: IAdvancedTabProp) {
        super(props);
        this.state = {
            exchange: EXCHANGES[Object.keys(EXCHANGES)[0]]
        };
    }

    public onExchangeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({exchange: EXCHANGES[e.currentTarget.value]})
    }

    public calculateDailyBalance = async () => {
        const trades = this.props.savedData.trades.filter(trade => trade.exchange === this.state.exchange);
        this.setState({
            dailyBalance: await calculateDailyBalance(trades)
        });
    }

    public render() {
        return (
            <div className='AdvancedTab'>
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Exchange</label>
                    <select name='type' id='type' onChange={this.onExchangeChange}>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                    <Button label="Calculate Daily Balance" onClick={this.calculateDailyBalance}/>
                </div>
                { this.state.dailyBalance !== undefined &&
                    <DailyBalanceTable dailyBalance={this.state.dailyBalance}/>
                }
            </div>
        );
    }
}

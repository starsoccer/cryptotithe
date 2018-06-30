import * as React from 'react';
import { IHoldings, IPartialSavedData, ITrade, ITradeWithUSDRate } from '../../src/types';
import { TradesTable } from '../TradesTable';
export interface IViewTradesProp {
    holdings: IHoldings;
    trades: ITrade[];
    save(data: IPartialSavedData): Promise<boolean>;
}

export class ViewTrades extends React.Component<IViewTradesProp> {

    public save = (trades: ITrade[] | ITradeWithUSDRate[]) =>
        this.props.save({trades: trades as ITradeWithUSDRate[]})

    public render() {
        return (
            <div className='viewTrades'>
                {this.props.trades.length > 0 ?
                    <div>
                        <h3 className='tc'>Trades</h3>
                        <hr className='center w-50' />
                        <TradesTable
                            trades={this.props.trades}
                            save={this.save}
                        />
                    </div>
                :
                    <h3 className='tc'>No Trades <i className='fa fa-frown-o'></i></h3>
                }
            </div>
        );
    }
}

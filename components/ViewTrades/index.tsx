import * as React from 'react';
import { IHoldings, ITrade } from '../../src/types';
import { TradesTable } from '../TradesTable';
export interface IViewTradesProp {
    holdings: IHoldings;
    trades: ITrade[];
}

interface IViewTradesState {
    currentTrades: ITrade[];
    holdings: IHoldings;
}

export class ViewTrades extends React.Component<IViewTradesProp, IViewTradesState> {
    constructor(props: IViewTradesProp) {
        super(props);
        this.state = {
            currentTrades: this.props.trades,
            holdings: this.props.holdings,
        };
    }

    public render() {
        return (
            <div className='viewTrades'>
                {this.state.currentTrades.length > 0 ?
                    <div>
                        <h3 className='tc'>Trades</h3>
                        <hr className='center w-50' />
                        <TradesTable trades={this.state.currentTrades}/>
                    </div>
                :
                    <h3 className='tc'>No Trades <i className='fa fa-frown'></i></h3>
                }
            </div>
        );
    }
}

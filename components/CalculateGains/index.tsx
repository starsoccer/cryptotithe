import * as React from 'react';
import { calculateGains } from '../../src/processing/CalculateGains';
import { IHoldings, ITradeWithGains, ITradeWithUSDRate } from '../../src/types';
// import { AlertBar, AlertType } from '../AlertBar';
// import Button from '../Button';
import { GainsPerTradeTable } from '../GainsPerTradeTable';
// import { Loader } from '../Loader';
export interface ICalculateTradesProp {
    holdings: IHoldings;
    trades: ITradeWithUSDRate[];
}

export interface ICalculateTradesState {
    tradeGains?: ITradeWithGains[];
}

export class CalculateGains extends React.Component<ICalculateTradesProp, ICalculateTradesState> {
    constructor(props: ICalculateTradesProp) {
        super(props);
        this.state = {};
    }

    public calculateGains = () => {
        const newTrades = calculateGains(this.props.holdings, this.props.trades);
        return newTrades;
    }

    public render() {
        return (
            <div className='calculategains'>
                { this.state.tradeGains !== undefined &&
                    <GainsPerTradeTable
                        trades={this.state.tradeGains}
                    />
                }
            </div>
        );
    }
}

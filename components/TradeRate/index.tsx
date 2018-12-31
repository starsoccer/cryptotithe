import * as React from 'react';
export interface ITradeRate {
    rate: number;
    amountSold: number;
}

export class TradeRate extends React.PureComponent<ITradeRate> {
    public render() {
        return (
            <div>
                <span className='nowrap'>
                    {this.props.rate.toFixed(8)}
                    <i className='pl1 fa fa-arrow-circle-right'/>
                </span>
                <br />
                <span className='nowrap'>
                    <i className='pr1 fa fa-arrow-circle-left'/>
                    {(this.props.amountSold / this.props.rate / this.props.amountSold).toFixed(8)}
                </span>
            </div>
        );
    }
}

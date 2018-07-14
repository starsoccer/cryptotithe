import * as crypto from 'crypto';
import * as React from 'react';
import * as validator from 'validator';
import { EXCHANGES, IPartialTrade, ITrade } from '../../src/types';
import Button from '../Button';
import { createDateAsUTC } from '../../src/parsers/utils';

export interface ITradeDetailsProps {
    className?: string;
    trade?: ITrade;
    onSubmit(trade: ITrade): void;
}

export interface ITradeDetailsState {
    boughtCurrency: string;
    soldCurrency: string;
    amountBought: string;
    amountSold: string;
    rate: string;
    date: Date;
    exchange: EXCHANGES | string;
    id: string;
    [key: string]: string | EXCHANGES | Date;
}

export default class TradeDetails extends React.Component<ITradeDetailsProps, ITradeDetailsState> {
    public constructor(props: ITradeDetailsProps) {
        super(props);
        if ('trade' in props && props.trade !== undefined) {
            this.state = {
                boughtCurrency: props.trade.boughtCurrency,
                soldCurrency: props.trade.soldCurrency,
                amountBought: (props.trade.amountSold / props.trade.rate).toString(),
                amountSold: props.trade.amountSold.toString(),
                rate: props.trade.rate.toString(),
                date: new Date(props.trade.date),
                exchange: props.trade.exchange,
                id: props.trade.id,
            };
        } else {
            this.state = {
                boughtCurrency: '',
                soldCurrency: '',
                amountSold: '',
                amountBought: '',
                rate: '',
                date: new Date(),
                exchange: '',
                id: '',
            };
        }
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let rate = this.state.rate;
        if (key === 'amountBought' && this.state.amountSold !== '' && this.state.amountSold !== '0') {
            rate = (parseFloat(this.state.amountSold) / parseFloat(e.currentTarget.value)).toString();
        }
        if (key === 'amountSold'  && this.state.amountBought !== '' && this.state.amountBought !== '0') {
            rate = (parseFloat(e.currentTarget.value) / parseFloat(this.state.amountBought)).toString();
        }
        this.setState({ [key]: e.currentTarget.value, rate });
    }

    public onSubmit = () => {
        const errors = [];
        const keys = Object.keys(this.state);
        for (const key of keys) {
            switch (key) {
                case 'boughtCurrency':
                case 'soldCurrency':
                    if (!validator.isAlpha(this.state[key])) {
                        errors.push(`${key} must consist of only english letters`);
                        break;
                    }
                    if (!validator.isLength(this.state[key], {min: 3, max: 5})) {
                        errors.push(`${key} must be 3 to 5 characters long`);
                        break;
                    }
                    break;
                case 'amountBought':
                case 'amountSold':
                    if (!validator.isNumeric(this.state[key].toString())) {
                        errors.push(`${key} must be numerical`);
                        break;
                    }
                    if (!validator.isFloat(this.state[key].toString(), {min: 0.00000001})) {
                        errors.push(`${key} must be greater then 0.00000001`);
                        break;
                    }
                    break;
                case 'date':
                    if (!validator.isAfter(this.state[key].toString(), '1/1/2010')) {
                        errors.push(`${key} must be a date after 2010`);
                        break;
                    }
                    if (!validator.isBefore(this.state[key].toString())) {
                        errors.push(`${key} must be a date in the present or past not future`);
                        break;
                    }
                    break;
            }
        }
        if (errors.length) {
            alert(errors.join('\n'));
        } else {
            const trade: IPartialTrade = {
                date: createDateAsUTC(new Date(this.state.date)).getTime(),
                amountSold: parseFloat(this.state.amountSold),
                boughtCurrency: this.state.boughtCurrency.toUpperCase(),
                soldCurrency: this.state.soldCurrency.toUpperCase(),
                rate: parseFloat(this.state.rate),
                exchange: this.state.exchange as EXCHANGES,
            };
            let id = this.state.id;
            if (id === '') {
                id = crypto.createHash('sha256').update(JSON.stringify(trade)).digest('hex');
            }
            trade.id = id;
            this.props.onSubmit(trade as ITrade);
        }
    }

    public render() {
        return (
            <div className={`TradeDetails w-70 center tc ${this.props.className}`}>
                <div className='fl w-100 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Exchange</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.exchange}
                        onChange={this.onChange('exchange')}
                    />
                </div>
                <div className='fl w-100 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>ID</h4>
                    <p className='pb0 mb0 pt0 mt0 tc'>will default to a hash of all trade data</p>
                    <input
                        className='w-100 tc'
                        value={this.state.id}
                        onChange={this.onChange('id')}
                    />
                </div>
                <div className='fl w-100 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Date</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.date.toString()}
                        onChange={this.onChange('date')}
                    />
                </div>
                <div className='fl w-50 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Bought Currency</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.boughtCurrency}
                        onChange={this.onChange('boughtCurrency')}
                    />
                </div>
                <div className='fl w-50 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Sold Currency</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.soldCurrency}
                        onChange={this.onChange('soldCurrency')}
                    />
                </div>
                <div className='fl w-third  pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Bought Amount</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.amountBought}
                        onChange={this.onChange('amountBought')}
                    />
                </div>
                <div className='fl w-third  pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Rate</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.rate}
                        readOnly={true}
                    />
                </div>
                <div className='fl w-third  pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Sold Amount</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.amountSold}
                        onChange={this.onChange('amountSold')}
                    />
                </div>
                <div className='fl w-100'>
                    <Button className='center' label='Add Trade' onClick={this.onSubmit}/>
                </div>
            </div>
        );
    }
}

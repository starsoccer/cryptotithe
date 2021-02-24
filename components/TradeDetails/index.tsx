import { Button, Intent } from '@blueprintjs/core';
import * as React from 'react';
import * as validator from 'validator';
import { createDateAsUTC, createID } from '../../src/parsers/utils';
import { EXCHANGES, ISettings, ITrade } from '../../src/types';
import { Select } from '../Select';

export interface ITradeDetailsProps<TradeType extends ITrade> {
    className?: string;
    trade?: TradeType;
    settings: ISettings;
    onSubmit(trade: TradeType): void;
}

export interface ITradeDetailsState {
    boughtCurrency: string;
    soldCurrency: string;
    amountBought: string;
    amountSold: string;
    date: Date;
    exchange: EXCHANGES | string;
    id: string;
    exchangeID: string;
    transactionFee: string;
    transactionFeeCurrency: string;
    [key: string]: string | EXCHANGES | Date;
}

export default class TradeDetails<TradeType extends ITrade> extends
    React.Component<ITradeDetailsProps<TradeType>, ITradeDetailsState> {
    public constructor(props: ITradeDetailsProps<TradeType>) {
        super(props);
        if ('trade' in props && props.trade !== undefined) {
            this.state = {
                boughtCurrency: props.trade.boughtCurrency,
                soldCurrency: props.trade.soldCurrency,
                amountBought: (props.trade.amountSold / props.trade.rate).toString(),
                amountSold: props.trade.amountSold.toString(),
                date: new Date(props.trade.date),
                exchange: props.trade.exchange,
                id: props.trade.ID,
                exchangeID: props.trade.exchangeID,
                transactionFee: props.trade.transactionFee.toString(),
                transactionFeeCurrency: props.trade.transactionFeeCurrency,
            };
        } else {
            this.state = {
                boughtCurrency: '',
                soldCurrency: '',
                amountSold: '',
                amountBought: '',
                date: new Date(),
                exchange: '',
                id: '',
                exchangeID: '',
                transactionFee: '',
                transactionFeeCurrency: '',
            };
        }
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ [key]: e.currentTarget.value });
    }

    public onSelectChange = (key: string) => (value: string) => {
        this.setState({ [key]: value });
    }

    public onSubmit = () => {
        const errors = [];
        const keys = Object.keys(this.state);
        for (const key of keys) {
            switch (key) {
                case 'boughtCurrency':
                case 'soldCurrency':
                    if (!validator.isAlphanumeric(this.state[key])) {
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
                case 'date': {
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
                case 'transactionFee': {
                    if (
                        !validator.isEmpty(this.state[key]) && !validator.isNumeric(this.state[key].toString())
                    ) {
                        errors.push(`${key} must be numerical and greater then 0.00000001`);
                    }
                    break;
                }
                case 'transactionFeeCurrency': {
                    const boughtCurrency = this.state.boughtCurrency.toUpperCase();
                    const soldCurrency = this.state.soldCurrency.toUpperCase();
                    const feeCurrency =  this.state.transactionFeeCurrency.toUpperCase();
                    if (
                        !validator.isEmpty(this.state[key]) && (
                            feeCurrency !== boughtCurrency &&
                            feeCurrency !== soldCurrency &&
                            feeCurrency !== this.props.settings.fiatCurrency
                        )
                    ) {
                        errors.push(`${key} must be either ${boughtCurrency} or ${soldCurrency}`,
                        );
                    }
                    break;
                }
            }
        }
        if (errors.length) {
            alert(errors.join('\n'));
        } else {
            const trade = Object.assign({}, this.props.trade);
            trade.date = createDateAsUTC(new Date(this.state.date)).getTime();
            trade.amountSold = parseFloat(this.state.amountSold);
            trade.boughtCurrency = this.state.boughtCurrency.toUpperCase();
            trade.soldCurrency = this.state.soldCurrency.toUpperCase();
            trade.rate = this.calculateRate(true);
            trade.exchange = this.state.exchange as EXCHANGES;
            trade.transactionFee = (this.state.transactionFee === '' ? 0 : parseFloat(this.state.transactionFee));
            if (this.state.id === '') {
                trade.ID = createID(trade);
            } else {
                trade.ID = this.state.id;
            }

            trade.exchangeID = (this.state.exchangeID === '' ? trade.ID : this.state.exchangeID);

            trade.transactionFeeCurrency = (this.state.transactionFeeCurrency === '' ?
                trade.boughtCurrency : this.state.transactionFeeCurrency.toUpperCase()
            );

            this.props.onSubmit(trade as TradeType);
        }
    }

    public calculateRate = (boughtTimesSold: boolean) => {
        if (
            this.state.amountBought && this.state.amountSold &&
            this.state.amountBought !== '0' && this.state.amountSold !== '0'
        ) {
            if (boughtTimesSold) {
                return parseFloat(this.state.amountSold) / parseFloat(this.state.amountBought);
            } else {
                return parseFloat(this.state.amountBought) / parseFloat(this.state.amountSold);
            }
        } else {
            return 0;
        }
    }

    public render() {
        return (
            <div className={`TradeDetails w-70 center tc ${this.props.className}`}>
                <div className='flex w-100 pa1'>
                    <div className='w-30 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Exchange</h4>
                        <Select
                            className='w-100 tc'
                            onChange={this.onSelectChange('exchange')}
                            options={Object.assign(EXCHANGES)}
                            inputFallback={true}
                        />
                    </div>
                    <div className='w-70 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Date</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.date.toString()}
                            onChange={this.onChange('date')}
                        />
                    </div>
                </div>
                <div className='w-100 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Exchange ID</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.exchangeID}
                        onChange={this.onChange('exchangeID')}
                    />
                </div>
                <div className='flex w-100 pa1'>
                    <div className='w-50 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Bought Currency</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.boughtCurrency}
                            onChange={this.onChange('boughtCurrency')}
                        />
                    </div>
                    <div className='w-50 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Sold Currency</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.soldCurrency}
                            onChange={this.onChange('soldCurrency')}
                        />
                    </div>
                </div>
                <div className='flex w-100 pa1'>
                    <div className='w-third pa1 pt3 mt1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Bought Amount</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.amountBought}
                            onChange={this.onChange('amountBought')}
                        />
                    </div>
                    <div className='w-third pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Rate</h4>
                        <input
                            className='w-100 tc mv1'
                            value={this.calculateRate(true)}
                            readOnly={true}
                        />
                        <input
                            className='w-100 tc mv1'
                            value={this.calculateRate(false)}
                            readOnly={true}
                        />
                    </div>
                    <div className='w-third pa1 pt3 mt1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Sold Amount</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.amountSold}
                            onChange={this.onChange('amountSold')}
                        />
                    </div>
                </div>
                <div className='flex w-100 pa1'>
                    <div className='w-30 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Transaction Fee Currency</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.transactionFeeCurrency}
                            onChange={this.onChange('transactionFeeCurrency')}
                        />
                    </div>
                    <div className='w-70 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Transaction Fee</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.transactionFee}
                            onChange={this.onChange('transactionFee')}
                        />
                    </div>
                </div>
                <div className='w-100'>
                    <Button
                        intent={Intent.PRIMARY}
                        icon="plus"
                        className='center'
                        onClick={this.onSubmit}
                    >
                        Add Trade
                    </Button>
                </div>
            </div>
        );
    }
}

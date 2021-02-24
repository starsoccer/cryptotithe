import { Button, Intent } from '@blueprintjs/core';
import * as React from 'react';
import * as validator from 'validator';
import { createDateAsUTC, createID } from '../../src/parsers/utils';
import { EXCHANGES, ISettings, ITransaction, Location } from '../../src/types';
import { Select } from '../Select';

export interface ITransactionDetailsProps {
    className?: string;
    transaction?: ITransaction;
    settings: ISettings;
    onSubmit(transaction: ITransaction): void;
}

export interface ITransactionDetailsState {
    from: Location;
    to: Location;
    amount: string;
    currency: string;
    ID: string;
    date: Date;
    [key: string]: string | Location | Date;
}

export default class TransactionDetails extends React.Component<ITransactionDetailsProps, ITransactionDetailsState> {
    public constructor(props: ITransactionDetailsProps) {
        super(props);
        if ('transaction' in props && props.transaction !== undefined) {
            this.state = {
                from: props.transaction.from,
                to: props.transaction.to,
                amount: props.transaction.amount.toString(),
                currency: props.transaction.currency,
                ID: props.transaction.ID,
                date: new Date(props.transaction.date),
            };
        } else {
            this.state = {
                from: '',
                to: '',
                amount: '',
                currency: '',
                ID: '',
                date: new Date(),
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
                case 'currency':
                    if (!validator.isAlpha(this.state[key])) {
                        errors.push(`${key} must consist of only english letters`);
                        break;
                    }
                    if (!validator.isLength(this.state[key], {min: 3, max: 5})) {
                        errors.push(`${key} must be 3 to 5 characters long`);
                        break;
                    }
                    break;
                case 'amount':
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
            const transaction = Object.assign({}, this.props.transaction);
            transaction.date = createDateAsUTC(new Date(this.state.date)).getTime();
            transaction.amount = parseFloat(this.state.amount);
            transaction.currency = this.state.currency.toUpperCase();
            transaction.to = this.state.to;
            transaction.from = this.state.from;
            if (this.state.ID === '') {
                transaction.ID = createID(transaction);
            } else {
                transaction.ID = this.state.ID;
            }

            this.props.onSubmit(transaction);
        }
    }

    public render() {
        return (
            <div className={`TradeDetails w-70 center tc ${this.props.className}`}>
                <div className='flex w-100 pa1'>
                    <div className='w-50 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>From</h4>
                        <Select
                            className='w-100 tc'
                            onChange={this.onSelectChange('from')}
                            options={Object.assign(EXCHANGES)}
                            inputFallback={true}
                        />
                    </div>
                    <div className='w-50 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>To</h4>
                        <Select
                            className='w-100 tc'
                            onChange={this.onSelectChange('to')}
                            options={Object.assign(EXCHANGES)}
                            inputFallback={true}
                        />
                    </div>
                </div>
                <div className='flex w-100 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Date</h4>
                    <input
                        className='w-100 tc'
                        value={this.state.date.toString()}
                        onChange={this.onChange('date')}
                    />
                </div>
                <div className='flex w-100 pa1'>
                    <div className='w-50 pa1'>
                        <h4 className='pb0 mb0 pt0 mt0 tc'>Currency</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.currency}
                            onChange={this.onChange('currency')}
                        />
                    </div>
                    <div className='w-50 pa1'>
                    <h4 className='pb0 mb0 pt0 mt0 tc'>Amount</h4>
                        <input
                            className='w-100 tc'
                            value={this.state.amount}
                            onChange={this.onChange('amount')}
                        />
                    </div>
                </div>
                <div className='w-100'>
                    <Button
                        className="center"
                        onClick={this.onSubmit}
                        intent={Intent.SUCCESS}
                        icon="plus"
                    >
                        Add Trade
                    </Button>
                </div>
            </div>
        );
    }
}

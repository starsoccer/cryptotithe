import { Button, Intent } from '@blueprintjs/core';
import * as React from 'react';
import { IPartialSavedData, ISavedData } from '../../../../../src/types';
import { Table } from '../../../../Table';

export interface ITransactionFeeProp {
    savedData: ISavedData;
    save: (data: IPartialSavedData) => Promise<boolean>;
}

interface ITransactionFeeState {
    maxHolding: number;
    smallHoldings: {[key: string]: number};
}

export default class TransactionFee extends React.Component<ITransactionFeeProp, ITransactionFeeState> {
    public constructor(props: ITransactionFeeProp) {
        super(props);
        this.state = {
            maxHolding: 0,
            smallHoldings: {},
        };
    }

    public componentDidUpdate(_prevProps: ITransactionFeeProp, prevState: ITransactionFeeState) {
        if (this.state.maxHolding !== prevState.maxHolding && !isNaN(this.state.maxHolding)) {
            const currencies = Object.keys(this.props.savedData.holdings);
            const smallHoldings = {};
            for (const currency of currencies) {
                let total = 0;
                for (const holding of this.props.savedData.holdings[currency]) {
                    total += holding.amount;
                    if (total > this.state.maxHolding) {
                        break;
                    }
                }

                if (total < this.state.maxHolding) {
                    smallHoldings[currency] = total;
                }
            }

            this.setState({smallHoldings});
        }
    }

    public onMaxHoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({maxHolding: parseFloat(e.currentTarget.value)});
    }

    public markTransactionFee = (currency: string) => () => {
        const newTrades =  this.props.savedData.trades;
        const currencyTrades = newTrades.filter((trade) => trade.boughtCurrency === currency);
        const lastTrade = currencyTrades[currencyTrades.length - 1];
        lastTrade.transactionFeeCurrency = currency;
        lastTrade.transactionFee = this.state.smallHoldings[currency];
        this.props.save({
            trades: newTrades,
        });
    }

    public render() {
        return (
            <div className='TransactionFee'>
                <div className='tc center'>
                    <input onChange={this.onMaxHoldingChange} />
                </div>
                <Table
                    headers={[
                        'Currency',
                        'Amount',
                        '',
                    ]}
                    rows={Object.keys(this.state.smallHoldings).map((currency) => [
                        <span>{currency}</span>,
                        <span>{this.state.smallHoldings[currency]}</span>,
                        <Button
                            icon="percentage"
                            intent={Intent.WARNING}
                            onClick={this.markTransactionFee(currency)}
                        >
                            Mark as Transaction Fee
                        </Button>,
                    ])}
                />
            </div>
        );
    }
}

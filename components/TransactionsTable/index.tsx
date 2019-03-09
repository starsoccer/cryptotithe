import * as React from 'react';
import sortTransactions from '../../src/processing/sortTransactions';
import { ISettings, ITransaction } from '../../src/types';
import Popup from '../Popup';
import { Table } from '../Table';
import TransactionDetails from '../TransactionDetails';

export interface ITransactionTableProps {
    className?: string;
    transactions: ITransaction[];
    settings: ISettings;
    save(transactions: ITransaction[]): void;
}

export class TransactionsTable extends React.Component<ITransactionTableProps, {popup: string | undefined}> {

    public constructor(props: ITransactionTableProps) {
        super(props);
        this.state = {
            popup: undefined,
        };
    }

    public changePopupStatus = (transactionID: string | undefined) => () => {
        this.setState({popup: transactionID});
    }

    public editTrade = (originalID: string) => async (editedTrade: ITransaction) => {
        const newTransactions = this.props.transactions.filter((transaction) => transaction.ID !== originalID);
        newTransactions.push(editedTrade);
        const sortedTransactions = sortTransactions(newTransactions);
        await this.props.save(sortedTransactions);
        this.setState({popup: undefined});
    }

    public render() {
        return (
            <div>
                <Table
                    headers={[
                        'Date',
                        'ID',
                        'Amount',
                        'Currency',
                        'From',
                        'To',
                        '',
                    ]}
                    rows={this.props.transactions.map((transaction) => [
                        <span>{new Date(transaction.date).toUTCString()}</span>,
                        <span>{transaction.ID}</span>,
                        <span>{transaction.amount.toFixed(8)}</span>,
                        <span>{transaction.currency}</span>,
                        <span>{transaction.from}</span>,
                        <span>{transaction.to}</span>,
                        <i className='fa fa-pencil-square' onClick={this.changePopupStatus(transaction.ID)}/>,
                    ])}
                />
                { this.state.popup !== undefined &&
                    <Popup
                        children={<TransactionDetails
                            onSubmit={this.editTrade(this.state.popup)}
                            transaction={this.props.transactions.filter((transaction) =>
                                transaction.ID === this.state.popup,
                            )[0]}
                            className='w-100'
                            settings={this.props.settings}
                        />}
                        className='w-70'
                        onClose={this.changePopupStatus(undefined)}
                    />
                }
            </div>
        );
    }
}

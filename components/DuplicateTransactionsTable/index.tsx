import * as React from 'react';
import { ITransactionWithDuplicateProbability } from '../../src/types';
import { Table } from '../Table';
import { Toggle } from '../Toggle';

export interface IDuplicateTransactionsTableProps {
    className?: string;
    transactions: ITransactionWithDuplicateProbability[];
    duplicateChange(transactionID: string): (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export class DuplicateTransactionsTable extends React.PureComponent<IDuplicateTransactionsTableProps> {
    public render() {
        return (
            <Table
                headers={[
                    'Date',
                    'ID',
                    'Amount',
                    'Currency',
                    'From',
                    'To',
                    'Duplicate Probability',
                    'Duplicate',
                ]}
                rows={this.props.transactions.map((transaction) => [
                    <span>{new Date(transaction.date).toUTCString()}</span>,
                    <span>{transaction.ID}</span>,
                    <span>{transaction.amount.toFixed(8)}</span>,
                    <span>{transaction.currency}</span>,
                    <span>{transaction.from}</span>,
                    <span>{transaction.to}</span>,
                    <span>{transaction.probability}</span>,
                    <Toggle
                        onChange={this.props.duplicateChange(transaction.ID)}
                        defaultValue={transaction.duplicate}
                    />,
                ])}
            />
        );
    }
}

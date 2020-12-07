import * as React from 'react';
import { IIncomeWithDuplicateProbability } from '../../src/types';
import { Table } from '../Table';
import { Toggle } from '../Toggle';

export interface IDuplicateIncomesTableProps {
    className?: string;
    incomes: IIncomeWithDuplicateProbability[];
    duplicateChange(incomeID: string): (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export class DuplicateIncomesTable extends React.PureComponent<IDuplicateIncomesTableProps> {
    public render() {
        return (
            <Table
                headers={[
                    'Date',
                    'ID',
                    'Amount',
                    'Currency',
                    'Fee',
                    'Duplicate Probability',
                    'Duplicate',
                ]}
                rows={this.props.incomes.map((income) => [
                    <span>{new Date(income.date).toUTCString()}</span>,
                    <span>{income.ID}</span>,
                    <span>{income.amount.toFixed(8)}</span>,
                    <span>{income.currency}</span>,
                    <span>{income.fee}</span>,
                    <span>{income.probability}</span>,
                    <Toggle
                        onChange={this.props.duplicateChange(income.ID)}
                        defaultValue={income.duplicate}
                    />,
                ])}
            />
        );
    }
}

import * as React from 'react';
import { addFiatRateToIncomes } from '../../src/processing/getFiatRateIncome';
import sortIncomes from '../../src/processing/SortIncome';
import { IIncome, IIncomeWithValue, ISettings } from '../../src/types';
//import Popup from '../Popup';
import { Table } from '../Table';

export interface IIncomesTableProps {
    className?: string;
    incomes: IIncome[] | IIncomeWithValue[];
    settings: ISettings;
    save?: (trades: IIncome[]) => void;
}

export class IncomesTable extends React.Component<IIncomesTableProps, {popup: string | undefined}> {
    public constructor(props: IIncomesTableProps) {
        super(props);
        this.state = {
            popup: undefined,
        };
    }

    public changePopupStatus = (tradeID: string | undefined) => () => {
        this.setState({popup: tradeID});
    }

    public editIncome = (originalID: string) => async (editedIncome: IIncome) => {
        const newIncomes = this.props.incomes.filter((trade) => trade.ID !== originalID);
        if ('fiatRate' in editedIncome) {
            const editedIncomeWithFiatRate = await addFiatRateToIncomes(
                [editedIncome], this.props.settings.fiatCurrency, this.props.settings.fiatRateMethod,
            );
            newIncomes.push(editedIncomeWithFiatRate[0]);
        } else {
            newIncomes.push(editedIncome);
        }
        const sortedIncomes = sortIncomes(newIncomes);
        if (this.props.save) {
            await this.props.save(sortedIncomes);
            this.setState({popup: undefined});
        }
    }

    private isEditable = !!this.props.save;
    private showValue = 'fiatRate' in this.props.incomes[0];

    private createHeaders = () => {
        const headers = [
            'Date',
            'ID',
            'Amount',
            'Currency',
            'Fee',
        ];

        if (this.showValue) {
            headers.push('Value');
        }

        if (this.isEditable) {
            headers.push('');
        }

        return headers;
    }

    private createRow = (income: IIncome | IIncomeWithValue) => {
        const row = [
            <span>{new Date(income.date).toUTCString()}</span>,
            <span>{income.ID}</span>,
            <span>{income.amount.toFixed(8)}</span>,
            <span>{income.currency}</span>,
            <span>{(income.fee ? income.fee.toFixed(8) : 0)}</span>,
        ];

        if (this.showValue) {
            row.push(<span>{(income as IIncomeWithValue).value}</span>);
        }

        if (this.isEditable) {
            row.push(<i className='fa fa-pencil-square' onClick={this.changePopupStatus(income.ID)}/>);
        }

        return row;
    }

    private createRows = () => {
        const rows = [];
        for (const income of this.props.incomes) {
            rows.push(this.createRow(income));   
        }

        return rows;
    }

    public render() {
        return (
            <div>
                <Table
                    headers={this.createHeaders()}
                    rows={this.createRows()}
                />
            </div>
        );
    }
}

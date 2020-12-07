import * as React from 'react';
import { addFiatRateToIncomes } from '../../src/processing/getFiatRateIncome';
import sortIncomes from '../../src/processing/SortIncome';
import { IIncome, IIncomeWithFiatRate, ISettings } from '../../src/types';
//import Popup from '../Popup';
import { Table } from '../Table';

export interface IIncomesTableProps {
    className?: string;
    incomes: IIncome[];
    settings: ISettings;
    save(trades: IIncome[] | IIncomeWithFiatRate[]): void;
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
        await this.props.save(sortedIncomes);
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
                        'Fee',
                        '',
                    ]}
                    rows={this.props.incomes.map((income) => [
                        <span>{new Date(income.date).toUTCString()}</span>,
                        <span>{income.ID}</span>,
                        <span>{income.amount.toFixed(8)}</span>,
                        <span>{income.currency}</span>,
                        <span>{(income.fee ? income.fee.toFixed(8) : 0)}</span>,
                        <i className='fa fa-pencil-square' onClick={this.changePopupStatus(income.ID)}/>,
                    ])}
                />
            </div>
        );
    }
}

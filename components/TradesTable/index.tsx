import * as React from 'react';
import sortTrades from '../../src/processing/SortTrades';
import { ITrade, ITradeWithUSDRate } from '../../src/types';
import Popup from '../Popup';
import { Table } from '../Table';
import TradeDetails from '../TradeDetails';

export interface ITradeTableProps {
    className?: string;
    trades: ITrade[];
    save: (trades: ITrade[] | ITradeWithUSDRate[]) => void;
}

export class TradesTable extends React.Component<ITradeTableProps, {popup: string | undefined}> {

    constructor(props: ITradeTableProps) {
        super(props);
        this.state = {
            popup: undefined,
        };
    }

    public changePopupStatus = (tradeID: string | undefined) => () => {
        this.setState({popup: tradeID});
    }

    public editTrade = (originalID: string) => async (editedTrade: ITrade) => {
        const newTrades = this.props.trades.filter((trade) => trade.id !== originalID);
        newTrades.push(editedTrade);
        const sortedTrades = sortTrades(newTrades);
        if (await this.props.save(sortedTrades)) {
            this.setState({popup: undefined});
        }
    }

    public render() {
        return (
            <div>
                <Table
                    headers={[
                        'Date',
                        'ID',
                        'Amount Sold',
                        'Sold Currency',
                        'Rate',
                        'Bought Currency',
                        'Amount Bought',
                        '',
                    ]}
                    rows={this.props.trades.map((trade) => [
                        <span>{new Date(trade.date).toUTCString()}</span>,
                        <span>{trade.id}</span>,
                        <span>{trade.amountSold.toFixed(8)}</span>,
                        <span>{trade.soldCurrency}</span>,
                        <span>{trade.rate.toFixed(8)}</span>,
                        <span>{trade.boughtCurrency}</span>,
                        <span>{(trade.amountSold / trade.rate).toFixed(8)}</span>,
                        <i className='fa fa-pencil-square' onClick={this.changePopupStatus(trade.id)}/>,
                    ])}
                />
                { this.state.popup !== undefined &&
                    <Popup
                        children={<TradeDetails
                            onSubmit={this.editTrade(this.state.popup)}
                            trade={this.props.trades.filter((trade) => trade.id === this.state.popup)[0]}
                            className='w-100'
                        />}
                        className='w-70'
                        onClose={this.changePopupStatus(undefined)}
                    />
                }
            </div>
        );
    }
}

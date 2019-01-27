import * as React from 'react';
import { addFiatRateToTrades } from '../../src/processing/getFiatRate';
import sortTrades from '../../src/processing/SortTrades';
import { ISettings, ITrade, ITradeWithFiatRate } from '../../src/types';
import Popup from '../Popup';
import { Table } from '../Table';
import TradeDetails from '../TradeDetails';
import { TradeRate } from '../TradeRate';

export interface ITradeTableProps {
    className?: string;
    trades: ITrade[];
    settings: ISettings;
    save(trades: ITrade[] | ITradeWithFiatRate[]): void;
}

export class TradesTable extends React.Component<ITradeTableProps, {popup: string | undefined}> {

    public constructor(props: ITradeTableProps) {
        super(props);
        this.state = {
            popup: undefined,
        };
    }

    public changePopupStatus = (tradeID: string | undefined) => () => {
        this.setState({popup: tradeID});
    }

    public editTrade = (originalID: string) => async (editedTrade: ITrade) => {
        const newTrades = this.props.trades.filter((trade) => trade.ID !== originalID);
        if ('fiatRate' in editedTrade) {
            const editedTradeWithFiatRate = await addFiatRateToTrades(
                [editedTrade], this.props.settings.fiatCurrency, this.props.settings.fiatRateMethod,
            );
            newTrades.push(editedTradeWithFiatRate[0]);
        } else {
            newTrades.push(editedTrade);
        }
        const sortedTrades = sortTrades(newTrades);
        await this.props.save(sortedTrades);
        this.setState({popup: undefined});
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
                        'Transaction Fee',
                        '',
                    ]}
                    rows={this.props.trades.map((trade) => [
                        <span>{new Date(trade.date).toUTCString()}</span>,
                        <span>{trade.exchangeID}</span>,
                        <span>{trade.amountSold.toFixed(8)}</span>,
                        <span>{trade.soldCurrency}</span>,
                        <TradeRate rate={trade.rate} amountSold={trade.amountSold}/>,
                        <span>{trade.boughtCurrency}</span>,
                        <span>{(trade.amountSold / trade.rate).toFixed(8)}</span>,
                        <span>{`${trade.transactionFee} ${trade.transactionFeeCurrency}`}</span>,
                        <i className='fa fa-pencil-square' onClick={this.changePopupStatus(trade.ID)}/>,
                    ])}
                />
                { this.state.popup !== undefined &&
                    <Popup
                        children={<TradeDetails
                            onSubmit={this.editTrade(this.state.popup)}
                            trade={this.props.trades.filter((trade) => trade.ID === this.state.popup)[0]}
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

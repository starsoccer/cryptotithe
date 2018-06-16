import * as React from 'react';
import { processData } from '../../src/parsers';
import duplicateCheck from '../../src/processing/DuplicateCheck';
import sortTrades from '../../src/processing/SortTrades';
import { EXCHANGES, IHoldings, ITrade, ITradeWithDuplicateProbability } from '../../src/types';
import { AlertBar, AlertType } from '../AlertBar';
import Button from '../Button';
import { DuplicateTradesTable } from '../DuplicateTradesTable';
import { Loader } from '../Loader';
import TradeDetails from '../TradeDetails';
import { TradesTable } from '../TradesTable';
export interface IAddTradesProp {
    holdings: IHoldings;
    trades: ITrade[];
    save: (holdings: IHoldings, trades: ITrade[]) => Promise<boolean>;
}

interface IAlertData {
    message: string;
    type: AlertType;
}

interface IAddTradesState {
    currentTrades: ITrade[];
    processedTrades: ITrade[];
    processing: boolean;
    holdings: IHoldings;
    duplicateTrades: ITradeWithDuplicateProbability[];
    alertData: IAlertData;
    addTrade: boolean;
}

export class AddTrades extends React.Component<IAddTradesProp, IAddTradesState> {
    constructor(props: IAddTradesProp) {
        super(props);
        this.state = {
            processedTrades: [],
            currentTrades: this.props.trades,
            holdings: this.props.holdings,
            processing: false,
            duplicateTrades: [],
            alertData: {} as IAlertData,
            addTrade: false,
        };
    }

    public onSubmit = async (): Promise<void> => {
        this.setState({processing: true});
        const { dialog } = require('electron').remote;
        const filePaths = await dialog.showOpenDialog({properties: ['openFile']});
        const exchange: keyof typeof EXCHANGES = (document.getElementById('type') as HTMLSelectElement)
            .value as keyof typeof EXCHANGES;
        const processedData: ITrade[] = await processData(exchange, filePaths[0]);
        if (processedData && processedData.length) {
            const duplicateTrades = duplicateCheck(this.state.currentTrades, processedData);
            if (duplicateTrades.length) {
                this.setState({
                    duplicateTrades,
                    alertData: {
                        message: 'Duplicate Trades Detected',
                        type: AlertType.WARNING,
                    },
                    processing: false,
                });
            } else {
                this.setState({
                    processedTrades: processedData,
                    processing: false,
                });
            }
        } else {
            alert('Error processing data');
        }
    }

    public saveData = async (holdings: IHoldings, trades: ITrade[]): Promise<boolean>  => {
        const result = await this.props.save(holdings, trades);
        if (result) {
            this.setState({
                currentTrades: trades,
                alertData: {
                    message: 'Trades Saved',
                    type: AlertType.SUCCESS,
                },
                processedTrades: [],
            });
            return true;
        } else {
            this.setState({
                alertData: {
                    message: 'Unable to Save Trades',
                    type: AlertType.ERROR,
                },
            });
            return false;
        }
    }

    public processTrades = async (): Promise<void> => {
        const duplicateToSave = this.state.duplicateTrades.filter((trade) => trade.duplicate);
        const newTrades = sortTrades(
            this.state.currentTrades.concat(duplicateToSave).concat(this.state.processedTrades),
        );
        this.saveData(this.state.holdings, newTrades);
    }

    public setAlertData = (type?: AlertType, message?: string) => {
        this.setState({alertData: {type, message} as IAlertData});
    }

    public duplicateStatusChange = (tradeID: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = this.state.duplicateTrades.findIndex((trade) => trade.id === tradeID);
        const newDuplicateTrades = this.state.duplicateTrades;
        newDuplicateTrades[id].duplicate = e.currentTarget.checked;
        this.setState({duplicateTrades: newDuplicateTrades});
    }

    public addTrade = async (trade: ITrade) => {
        const newTrades = this.state.processedTrades;
        newTrades.push(trade);
        this.setState({processedTrades: newTrades, addTrade: false});
    }

    public setAddTradeDisplay = () => {
        this.setState({addTrade: !this.state.addTrade});
    }

    public render() {
        return (
            <div className='addTrades'>
                {Object.keys(this.state.alertData).length > 0 &&
                    <AlertBar
                        onClick={this.setAlertData}
                        {...this.state.alertData}
                    />
                }
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Import Type</label>
                    <select name='type' id='type'>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                </div>
                { this.state.addTrade &&
                    <TradeDetails
                        showAlert={this.setAlertData}
                        addTrade={this.addTrade}
                    />
                }
                <div className='flex justify-around pt2'>
                    <Button onClick={this.onSubmit} label='Load Trades'/>
                    <Button onClick={this.setAddTradeDisplay} label='Add Trade'/>
                    <Button onClick={this.processTrades} label='Save/Process Trades'/>
                </div>
                {this.state.processing &&
                    <Loader />
                }
                {this.state.duplicateTrades.length > 0 &&
                    <div>
                        <h3 className='tc'>Duplicate Trades</h3>
                        <hr className='center w-50' />
                        <DuplicateTradesTable
                            trades={this.state.duplicateTrades}
                            duplicateChange={this.duplicateStatusChange}
                        />
                    </div>
                }
                {this.state.processedTrades.length > 0 &&
                    <div>
                        <h3 className='tc'>Trades to Add</h3>
                        <hr className='center w-50' />
                        <TradesTable trades={this.state.processedTrades}/>
                    </div>
                }
            </div>
        );
    }
}

import * as React from 'react';
import { processData } from '../../src/parsers';
import duplicateCheck from '../../src/processing/DuplicateCheck';
import { addUSDRateToTrades } from '../../src/processing/getUSDRate';
import sortTrades from '../../src/processing/SortTrades';
import {
    EXCHANGES,
    IHoldings,
    IPartialSavedData,
    ITrade,
    ITradeWithDuplicateProbability,
    ITradeWithUSDRate,
} from '../../src/types';
import { AlertBar, AlertType } from '../AlertBar';
import Button from '../Button';
import { DuplicateTradesTable } from '../DuplicateTradesTable';
import { FileBrowse } from '../FileBrowse';
import { Loader } from '../Loader';
import TradeDetails from '../TradeDetails';
import { TradesTable } from '../TradesTable';
export interface IAddTradesProp {
    holdings: IHoldings;
    trades: ITrade[];
    save(data: IPartialSavedData): Promise<boolean>;
}

interface IAlertData {
    message: string;
    type: AlertType;
}

interface IAddTradesState {
    addTrade: boolean;
    alertData: IAlertData;
    currentTrades: ITrade[];
    duplicateTrades: ITradeWithDuplicateProbability[];
    fileBrowseOpen: boolean;
    holdings: IHoldings;
    processedTrades: ITrade[];
    processing: boolean;
}

export class AddTrades extends React.Component<IAddTradesProp, IAddTradesState> {
    public constructor(props: IAddTradesProp) {
        super(props);
        this.state = {
            processedTrades: [],
            currentTrades: this.props.trades,
            holdings: this.props.holdings,
            processing: false,
            duplicateTrades: [],
            alertData: {} as IAlertData,
            addTrade: false,
            fileBrowseOpen: false,
        };
    }

    public openFileBrowser = async (): Promise<void> => {
        this.setState({fileBrowseOpen: true});
    }

    public readFile = async (fileData: string) => {
        this.setState({fileBrowseOpen: false});
        if (fileData !== '') {
            this.setState({processing: true});
            const exchange: keyof typeof EXCHANGES = (document.getElementById('type') as HTMLSelectElement)
                .value as keyof typeof EXCHANGES;
            const processedData: ITrade[] = await processData(exchange, fileData);
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
    }

    public processTrades = async (): Promise<void> => {
        this.setState({processing: true});
        const duplicateToSave = this.state.duplicateTrades.filter((trade) => trade.duplicate);
        const tradesToSave = this.state.processedTrades.concat(duplicateToSave);
        const tradesWithUSDRate: ITradeWithUSDRate[] = await addUSDRateToTrades(tradesToSave);

        const newTrades: ITradeWithUSDRate[] = sortTrades(
            this.state.currentTrades.concat(tradesWithUSDRate),
        ) as ITradeWithUSDRate[];
        if (await this.props.save({trades: newTrades})) {
            this.setState({
                currentTrades: newTrades,
                alertData: {
                    message: 'Trades Saved',
                    type: AlertType.SUCCESS,
                },
                processedTrades: [],
                duplicateTrades: [],
                processing: false,
            });
        } else {
            this.setState({
                alertData: {
                    message: 'Unable to Save Trades',
                    type: AlertType.ERROR,
                },
                processing: false,
            });
        }
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

    public editedTrade = (trades: ITrade[] | ITradeWithUSDRate[]) => {
        this.setState({processedTrades: trades});
        return true;
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
                        onSubmit={this.addTrade}
                        className='cf'
                    />
                }
                <div className='flex justify-around pt2'>
                    <Button onClick={this.openFileBrowser} label='Load Trades'/>
                    <FileBrowse
                        onLoaded={this.readFile}
                        browse={this.state.fileBrowseOpen}
                    />
                    <Button onClick={this.setAddTradeDisplay} label='Add Trade'/>
                    <Button onClick={this.processTrades} label='Save/Process Trades'/>
                </div>
                {this.state.processing ?
                    <Loader />
                :
                    <div>
                    {this.state.duplicateTrades.length > 0 &&
                        <div>
                            <h3 className='tc'>Duplicate Trades</h3>
                            <hr className='center w-50' />
                            <DuplicateTradesTable
                                trades={this.state.duplicateTrades}
                                duplicateChange={this.duplicateStatusChange}
                            />
                        </div>}
                    {this.state.processedTrades.length > 0 &&
                    <div>
                        <h3 className='tc'>Trades to Add</h3>
                        <hr className='center w-50' />
                        <TradesTable
                            trades={this.state.processedTrades}
                            save={this.editedTrade}
                        />
                    </div>
                    }
                    </div>
                }
            </div>
        );
    }
}

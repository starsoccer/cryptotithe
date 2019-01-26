import * as React from 'react';
import { processData } from '../../../src/parsers';
import duplicateCheck from '../../../src/processing/DuplicateCheck';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import sortTrades from '../../../src/processing/SortTrades';
import {
    EXCHANGES,
    IHoldings,
    IPartialSavedData,
    ISavedData,
    ITrade,
    ITradeWithDuplicateProbability,
    ITradeWithFiatRate,
} from '../../../src/types';
import { AlertBar, AlertType } from '../../AlertBar';
import Button from '../../Button';
import { DuplicateTradesTable } from '../../DuplicateTradesTable';
import { FileBrowse } from '../../FileBrowse';
import { Loader } from '../../Loader';
import TradeDetails from '../../TradeDetails';
import { TradesTable } from '../../TradesTable';
export interface IAddTradesTabProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

interface IAlertData {
    message: string;
    type: AlertType;
}

interface IAddTradesTabState {
    addTrade: boolean;
    alertData: IAlertData;
    currentTrades: ITrade[];
    duplicateTrades: ITradeWithDuplicateProbability[];
    fileBrowseOpen: boolean;
    holdings: IHoldings;
    processedTrades: ITrade[];
    processing: boolean;
    exchange: EXCHANGES | string;
}

export class AddTradesTab extends React.Component<IAddTradesTabProp, IAddTradesTabState> {
    public constructor(props: IAddTradesTabProp) {
        super(props);
        this.state = {
            processedTrades: [],
            currentTrades: this.props.savedData.trades,
            holdings: this.props.savedData.holdings,
            processing: false,
            duplicateTrades: [],
            alertData: {} as IAlertData,
            addTrade: false,
            fileBrowseOpen: false,
            exchange: '',
        };
    }

    public openFileBrowser = async (): Promise<void> => {
        this.setState({fileBrowseOpen: true});
    }

    public readFile = async (fileData: string, input: React.RefObject<HTMLInputElement>) => {
        this.setState({fileBrowseOpen: false});
        if (input.current !== null && input.current.files !== null && 0 in input.current.files) {
            if (input.current.files[0].name.match('.+(\.csv)$')) {
                if (fileData !== '') {
                    this.setState({processing: true});
                    const processedData: ITrade[] = await processData(this.state.exchange, fileData);
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
                } else {
                    alert('File Data is empty');
                }
            } else {
                alert('Not a valid file, must be a csv file');
            }
        }
    }

    public processTrades = async (): Promise<void> => {
        this.setState({processing: true});
        const duplicateToSave = this.state.duplicateTrades.filter((trade) => !trade.duplicate);
        const tradesToSave = this.state.processedTrades.concat(duplicateToSave);
        const tradesWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(
            tradesToSave,
            this.props.savedData.settings.fiatCurrency,
            this.props.savedData.settings.fiatRateMethod,
        );

        const newTrades: ITradeWithFiatRate[] = sortTrades(
            this.state.currentTrades.concat(tradesWithFiatRate),
        ) as ITradeWithFiatRate[];
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
        const id = this.state.duplicateTrades.findIndex((trade) => trade.ID === tradeID);
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

    public editedTrade = (trades: ITrade[] | ITradeWithFiatRate[]) => {
        this.setState({processedTrades: trades});
        return true;
    }

    public onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({exchange: e.currentTarget.value});
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
                    <select name='exchange' id='exchange' onChange={this.onSelectChange}>
                        <option key='Auto-Detect' value='Auto-Detect'>Auto-Detect</option>,
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={EXCHANGES[key]}>{key}</option>,
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
                            settings={this.props.savedData.settings}
                        />
                    </div>
                    }
                    </div>
                }
            </div>
        );
    }
}

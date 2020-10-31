import * as React from 'react';
import { processData } from '../../../src/parsers';
import duplicateCheck from '../../../src/processing/DuplicateCheck';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import sortTrades from '../../../src/processing/SortTrades';
import sortTransactions from '../../../src/processing/SortTransactions';
import {
    EXCHANGES,
    IDuplicate,
    IHoldings,
    IImport,
    ImportType,
    IPartialSavedData,
    ISavedData,
    ITrade,
    ITradeWithDuplicateProbability,
    ITradeWithFiatRate,
    ITransaction,
    ITransactionWithDuplicateProbability,
    TransactionImportType,
} from '../../../src/types';
import { AlertBar, AlertType } from '../../AlertBar';
import Button from '../../Button';
import { DuplicateTradesTable } from '../../DuplicateTradesTable';
import { DuplicateTransactionsTable } from '../../DuplicateTransactionsTable';
import { FileBrowse } from '../../FileBrowse';
import { Loader } from '../../Loader';
import TradeDetails from '../../TradeDetails';
// import TransactionDetails from '../../TransactionDetails';
import { TradesTable } from '../../TradesTable';
import { TransactionsTable } from '../../TransactionsTable';

export interface IImportDataTabProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

interface IAlertData {
    message: string;
    type: AlertType;
}

interface IImportDataTabState {
    addTrade: boolean;
    alertData: IAlertData;
    duplicateData: ITradeWithDuplicateProbability[] | ITransactionWithDuplicateProbability[];
    fileBrowseOpen: boolean;
    holdings: IHoldings;
    processedData: ITrade[] | ITransaction[];
    processing: boolean;
    importDetails: IImport;
}

export class ImportDataTab extends React.Component<IImportDataTabProp, IImportDataTabState> {
    public constructor(props: IImportDataTabProp) {
        super(props);
        this.state = {
            processedData: [],
            holdings: this.props.savedData.holdings,
            processing: false,
            duplicateData: [],
            alertData: {} as IAlertData,
            addTrade: false,
            fileBrowseOpen: false,
            importDetails: {
                location: '',
                type: ImportType.TRADES,
                data: '',
            },
        };
    }

    public openFileBrowser = async (): Promise<void> => {
        this.setState({fileBrowseOpen: true});
    }

    public readFile = async (fileData: string, input: React.RefObject<HTMLInputElement>) => {
        this.setState({fileBrowseOpen: false});
        if (input.current !== null && input.current.files !== null && 0 in input.current.files) {
            // eslint-disable-next-line
            if (input.current.files[0].name.match('.+(\.csv)$')) {
                if (fileData !== '') {
                    this.setState({processing: true});
                    const processedData = await processData({
                        ...this.state.importDetails,
                        data: fileData,
                    });
                    if (processedData && processedData.length) {
                        const duplicateData = duplicateCheck(
                            this.state.importDetails, this.props.savedData, processedData,
                        );
                        if ((duplicateData as IDuplicate[]).some((data) => data.probability !== 0)) {
                            this.setState({
                                duplicateData,
                                alertData: {
                                    message: 'Duplicate Trades Detected',
                                    type: AlertType.WARNING,
                                },
                                processing: false,
                            });
                        } else {
                            this.setState({
                                processedData,
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
        const duplicateToSave = (this.state.duplicateData as IDuplicate[]).filter((trade) => !trade.duplicate);
        const dataToSave = (this.state.processedData as any).concat(duplicateToSave);

        const newSavedData: Partial<ISavedData> = {};
        switch (this.state.importDetails.type) {
            case ImportType.TRADES: {
                const tradesWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(
                    dataToSave,
                    this.props.savedData.settings.fiatCurrency,
                    this.props.savedData.settings.fiatRateMethod,
                );
                const newTrades: ITradeWithFiatRate[] = sortTrades(
                    this.props.savedData.trades.concat(tradesWithFiatRate),
                ) as ITradeWithFiatRate[];
                newSavedData.trades = newTrades;
                break;
            }
            case ImportType.TRANSACTION: {
                const newTransactions: ITransaction[] = sortTransactions(
                    this.props.savedData.transactions.concat(dataToSave),
                );
                newSavedData.transactions = newTransactions;
                break;
            }
            default: {
                throw new Error(`Unknown Import Type - ${this.state.importDetails.type}`);
            }
        }

        if (await this.props.save(newSavedData)) {
            this.setState({
                alertData: {
                    message: 'Data Saved',
                    type: AlertType.SUCCESS,
                },
                processedData: [],
                duplicateData: [],
                processing: false,
            });
        } else {
            this.setState({
                alertData: {
                    message: 'Unable to Save Data',
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
        const id = (this.state.duplicateData as IDuplicate[]).findIndex((trade) => trade.ID === tradeID);
        const newDuplicateData = this.state.duplicateData;
        newDuplicateData[id].duplicate = e.currentTarget.checked;
        this.setState({duplicateData: newDuplicateData});
    }

    public addTrade = async (trade: ITrade) => {
        const newTrades = this.state.processedData as ITrade[];
        newTrades.push(trade);
        this.setState({processedData: newTrades, addTrade: false});
    }

    public setAddTradeDisplay = () => {
        this.setState({addTrade: !this.state.addTrade});
    }

    public editedTrade = (trades: ITrade[] | ITradeWithFiatRate[]) => {
        this.setState({processedData: trades});
        return true;
    }

    public editedTransaction = (transactions: ITransaction[]) => {
        this.setState({processedData: transactions});
        return true;
    }

    public onSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const importDetails: IImport = { ...this.state.importDetails };
        switch (key) {
            case 'location':
                importDetails.location = e.currentTarget.value;
                break;
            case 'type':
                importDetails.type = e.currentTarget.value as ImportType;
                break;
            case 'subtype':
                importDetails.subtype = e.currentTarget.value as TransactionImportType;
                break;
        }
        this.setState({importDetails});
    }

    public render() {
        return (
            <div className='import-data'>
                {Object.keys(this.state.alertData).length > 0 &&
                    <AlertBar
                        onClick={this.setAlertData}
                        {...this.state.alertData}
                    />
                }
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Import Type</label>
                    <select name='type' id='type' onChange={this.onSelectChange('type')}>
                        {Object.keys(ImportType).map((key) =>
                            <option key={key} value={ImportType[key]}>{key}</option>,
                        )}
                    </select>
                    <br />
                    { this.state.importDetails.type === ImportType.TRANSACTION &&
                        <div>
                            <label htmlFor='subtype' className='pr2'>Import SubType</label>
                            <select name='subtype' id='subtype' onChange={this.onSelectChange('subtype')}>
                                {Object.keys(TransactionImportType).map((key) =>
                                    <option key={key} value={TransactionImportType[key]}>{key}</option>,
                                )}
                            </select>
                        </div>
                    }
                    <label htmlFor='location' className='pr2'>Import Location</label>
                    <select name='location' id='location' onChange={this.onSelectChange('location')}>
                        { this.state.importDetails.type === ImportType.TRANSACTION ?
                            <option key='Binance' value='BINANCE'>Binance</option>
                        :
                            <>
                                <option key='Auto-Detect' value='Auto-Detect'>Auto-Detect</option>
                                {Object.keys(EXCHANGES).map((key) =>
                                    <option key={key} value={EXCHANGES[key]}>{key}</option>,
                                )}
                            </>
                        }

                    </select>
                </div>
                { this.state.addTrade &&
                    <TradeDetails
                        onSubmit={this.addTrade}
                        settings={this.props.savedData.settings}
                        className='cf'
                    />
                }
                <div className='flex justify-around pt2'>
                    <Button onClick={this.openFileBrowser} label='Import Data'/>
                    <FileBrowse
                        onLoaded={this.readFile}
                        browse={this.state.fileBrowseOpen}
                    />
                    <Button onClick={this.setAddTradeDisplay} label='Add Trade'/>
                    <Button onClick={this.processTrades} label='Save/Process Data'/>
                </div>
                {this.state.processing ?
                    <Loader />
                :
                    <div>
                        {this.state.duplicateData.length > 0 && this.state.importDetails.type === ImportType.TRADES &&
                            <div>
                                <h3 className='tc'>Duplicate Trades</h3>
                                <hr className='center w-50' />
                                <DuplicateTradesTable
                                    trades={this.state.duplicateData as ITradeWithDuplicateProbability[]}
                                    duplicateChange={this.duplicateStatusChange}
                                />
                            </div>}
                        {this.state.processedData.length > 0 && this.state.importDetails.type === ImportType.TRADES &&
                            <div>
                                <h3 className='tc'>Trades to Add</h3>
                                <hr className='center w-50' />
                                <TradesTable
                                    trades={this.state.processedData as ITrade[]}
                                    save={this.editedTrade}
                                    settings={this.props.savedData.settings}
                                />
                            </div>
                        }
                        {this.state.duplicateData.length > 0 &&
                        this.state.importDetails.type === ImportType.TRANSACTION &&
                            <div>
                                <h3 className='tc'>Duplicate Transactions</h3>
                                <hr className='center w-50' />
                                <DuplicateTransactionsTable
                                    transactions={this.state.duplicateData as ITransactionWithDuplicateProbability[]}
                                    duplicateChange={this.duplicateStatusChange}
                                />
                            </div>}
                        {this.state.processedData.length > 0 &&
                        this.state.importDetails.type === ImportType.TRANSACTION &&
                            <div>
                                <h3 className='tc'>Transactions to Add</h3>
                                <hr className='center w-50' />
                                <TransactionsTable
                                    transactions={this.state.processedData as ITransaction[]}
                                    save={this.editedTransaction}
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

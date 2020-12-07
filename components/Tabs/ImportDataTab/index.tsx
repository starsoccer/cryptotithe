import * as React from 'react';
import { processData } from '../../../src/parsers';
import duplicateCheck from '../../../src/processing/DuplicateCheck';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import { addFiatRateToIncomes } from '../../../src/processing/getFiatRateIncome'
import sortTrades from '../../../src/processing/SortTrades';
import sortTransactions from '../../../src/processing/SortTransactions';
import sortIncome from '../../../src/processing/SortIncome';
import {
    IDuplicate,
    IHoldings,
    IImport,
    ImportType,
    IncomeImportTypes,
    IPartialSavedData,
    ISavedData,
    ITrade,
    ITradeWithDuplicateProbability,
    ITradeWithFiatRate,
    ITransaction,
    ITransactionWithDuplicateProbability,
    TransactionImportType,
} from '../../../src/types';
import { IIncome, IIncomeWithDuplicateProbability, IIncomeWithFiatRate } from '../../../src/types/income';
import { AlertBar, AlertType } from '../../AlertBar';
import Button from '../../Button';
import { FileBrowse } from '../../FileBrowse';
import { Loader } from '../../Loader';
import TradeDetails from '../../TradeDetails';
import { ImportSelector } from './ImportSelector';
import { ImportTable } from './ImportTable';

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
    duplicateData: ITradeWithDuplicateProbability[] | ITransactionWithDuplicateProbability[] | IIncomeWithDuplicateProbability[];
    fileBrowseOpen: boolean;
    holdings: IHoldings;
    processedData: ITrade[] | ITransaction[] | IIncome[];
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
            case ImportType.INCOME: {
                const incomeWithFiatRate: IIncomeWithFiatRate[] = await addFiatRateToIncomes(
                    dataToSave,
                    this.props.savedData.settings.fiatCurrency,
                    this.props.savedData.settings.fiatRateMethod,
                );
                const newIncome: IIncomeWithFiatRate[] = sortIncome(
                    this.props.savedData.incomes.concat(incomeWithFiatRate),
                ) as IIncomeWithFiatRate[];
                newSavedData.incomes = newIncome;
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

    public editedData = (data: ITrade[] | ITradeWithFiatRate[] | ITransaction[] | IIncome[]) => {
        this.setState({processedData: data});
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
                switch (importDetails.type) {
                    case ImportType.INCOME:
                        importDetails.location = IncomeImportTypes.cryptoID;
                    default:
                }
                break;
            case 'subtype':
                importDetails.subtype = e.currentTarget.value as TransactionImportType;
                break;
        }
        this.setState({importDetails});
    }

    public onInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            importDetails: {
                ...this.state.importDetails,
                [key]: e.currentTarget.value
            }
        });
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
                <ImportSelector
                    onSelectChange={this.onSelectChange}
                    onInputChange={this.onInputChange}
                    importDetails={this.state.importDetails}
                />
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
                    <ImportTable
                        importDetails={this.state.importDetails}
                        duplicateData={this.state.duplicateData}
                        processedData={this.state.processedData}
                        duplicateStatusChange={this.duplicateStatusChange}
                        savedData={this.props.savedData}
                        saveEditedData={this.editedData}
                    />
                }
            </div>
        );
    }
}

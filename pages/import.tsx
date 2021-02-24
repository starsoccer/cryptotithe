import { useContext, useState } from 'react';
import SavedDataContext from '@contexts/savedData';
import { processData } from '../src/parsers';
import duplicateCheck from '../src/processing/DuplicateCheck';
import { addFiatRateToTrades } from '../src/processing/getFiatRate';
import { addFiatRateToIncomes } from '../src/processing/getFiatRateIncome'
import sortTrades from '../src/processing/SortTrades';
import sortTransactions from '../src/processing/SortTransactions';
import sortIncome from '../src/processing/SortIncome';
import {
    IDuplicate,
    IPartialSavedData,
    IImport,
    ImportType,
    IncomeImportTypes,
    ISavedData,
    ITrade,
    ITradeWithDuplicateProbability,
    ITradeWithFiatRate,
    ITransaction,
    ITransactionWithDuplicateProbability,
    TransactionImportType,
    IIncome,
    IIncomeWithDuplicateProbability,
    IIncomeWithFiatRate
} from '@types';
import { AlertBar, AlertType } from '@components/AlertBar';
import Button from '@components/Button';
import { FileBrowse } from '@components/FileBrowse';
import TradeDetails from '@components/TradeDetails';
import { ImportSelector } from '@components/Tabs/ImportDataTab/ImportSelector';
import { ImportTable } from '@components/Tabs/ImportDataTab/ImportTable';
import IncomeDetails from '@components/IncomeDetails';
import { Spinner } from '@blueprintjs/core';

interface IAlertData {
    message: string;
    type: AlertType;
}

type ProcessedDataTypes = ITrade[] | ITransaction[] | IIncome[];
type DuplicateDataTypes = ITradeWithDuplicateProbability[] | ITransactionWithDuplicateProbability[] | IIncomeWithDuplicateProbability[];

const processTrades = async (
    duplicateData: IDuplicate[],
    processedData: ProcessedDataTypes,
    importDetails: IImport,
    savedData: ISavedData,
    setProcessing: (processing: boolean) => void,
    save: (saveData: IPartialSavedData) => Promise<boolean>,
    setDuplicateData: (duplicateData: DuplicateDataTypes) => void,
    setAlertData: (alertData: IAlertData) => void,
    setProcessedData: (processedData: ProcessedDataTypes) => void,
): Promise<void> => {
    setProcessing(true);
    const duplicateToSave = (duplicateData as IDuplicate[]).filter((trade) => !trade.duplicate);
    const dataToSave = (processedData as any).concat(duplicateToSave);

    const newSavedData: Partial<ISavedData> = {};
    switch (importDetails.type) {
        case ImportType.TRADES: {
            const tradesWithFiatRate: ITradeWithFiatRate[] = await addFiatRateToTrades(
                dataToSave,
                savedData.settings.fiatCurrency,
                savedData.settings.fiatRateMethod,
            );
            const newTrades: ITradeWithFiatRate[] = sortTrades(
                savedData.trades.concat(tradesWithFiatRate),
            ) as ITradeWithFiatRate[];
            newSavedData.trades = newTrades;
            break;
        }
        case ImportType.TRANSACTION: {
            const newTransactions: ITransaction[] = sortTransactions(
                savedData.transactions.concat(dataToSave),
            );
            newSavedData.transactions = newTransactions;
            break;
        }
        case ImportType.INCOME: {
            const incomeWithFiatRate: IIncomeWithFiatRate[] = await addFiatRateToIncomes(
                dataToSave,
                savedData.settings.fiatCurrency,
                savedData.settings.fiatRateMethod,
            );
            const newIncome: IIncomeWithFiatRate[] = sortIncome(
                savedData.incomes.concat(incomeWithFiatRate),
            ) as IIncomeWithFiatRate[];
            newSavedData.incomes = newIncome;
            break;
        }
        default: {
            throw new Error(`Unknown Import Type - ${importDetails.type}`);
        }
    }

    if (await save(newSavedData)) {
        setAlertData({
            message: 'Data Saved',
            type: AlertType.SUCCESS,
        });
        setProcessedData([]);
        setDuplicateData([]);

    } else {
        setAlertData({
            message: 'Unable to Save Data',
            type: AlertType.ERROR,
        });
    }
    setProcessing(false);
}

const Import = () => {
    const {savedData, save} = useContext(SavedDataContext);
    const [addTrade, setAddTrade] = useState(false);
    const [showNewIncome, setShowNewIncome] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [fileBrowseOpen, setFileBrowseOpen] = useState(false);
    const [processedData, setProcessedData] = useState<ProcessedDataTypes>([]);
    const [duplicateData, setDuplicateData] = useState<DuplicateDataTypes>([]);
    const [alertData, setAlertData] = useState<IAlertData | undefined>(undefined);
    const [importDetails, setImportDetails] = useState<IImport>({
        location: '',
        type: ImportType.TRADES,
        data: '',
    });

    return (
        <div className='import-data'>
            {alertData && Object.keys(alertData).length > 0 &&
                <AlertBar
                    onClick={() => setAlertData({} as IAlertData)}
                    {...alertData}
                />
            }
            <ImportSelector
                onSelectChange={(key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => onImportDetailsChange(importDetails, setImportDetails, key, e.currentTarget.value)}
                onInputChange={(key: string) => (e: React.ChangeEvent<HTMLInputElement>) => onImportDetailsChange(importDetails, setImportDetails, key, e.currentTarget.value)}
                importDetails={importDetails}
            />

            { addTrade &&
                <TradeDetails
                    onSubmit={onAddTrade(processedData as ITrade[], setProcessedData, setAddTrade)}
                    settings={savedData.settings}
                    className='cf'
                />
            }

            { showNewIncome &&
                <IncomeDetails
                    onSave={onAddIncome(processedData as IIncome[], setProcessedData, setShowNewIncome)}
                />
            }

            <div className='flex justify-around pt2'>
                <Button onClick={() => setFileBrowseOpen(true)} label='Import Data'/>
                <FileBrowse
                    onLoaded={readFile(
                        importDetails,
                        savedData,
                        setFileBrowseOpen,
                        setProcessing,
                        setDuplicateData,
                        setAlertData,
                        setProcessedData,
                    )}
                    browse={fileBrowseOpen}
                />

                {importDetails.type == ImportType.TRADES &&
                    <Button onClick={() => setAddTrade(!addTrade)} label='Add Trade'/>
                }

                {importDetails.type == ImportType.INCOME &&
                    <Button onClick={() => setShowNewIncome(!showNewIncome)} label='Add Income'/>
                }

                <Button
                    onClick={() => processTrades(
                        duplicateData,
                        processedData,
                        importDetails,
                        savedData,
                        setProcessing,
                        save,
                        setDuplicateData,
                        setAlertData,
                        setProcessedData,
                    )}
                    label='Save/Process Data'
                />
            </div>
            {processing ?
                <Spinner />
            :
                <ImportTable
                    importDetails={importDetails}
                    duplicateData={duplicateData}
                    processedData={processedData}
                    duplicateStatusChange={updateDuplicateStatus(duplicateData, setDuplicateData)}
                    savedData={savedData}
                    saveEditedData={(data) => setProcessedData(data)}
                />
            }
        </div>
    );
};

const onImportDetailsChange = (
    importDetails: IImport,
    setImportDetails: (importDetails: IImport) => void,
    key: string,
    value: string,
) => {
    const newImportDetails: IImport = { ...importDetails };
    switch (key) {
        case 'location':
            newImportDetails.location = value;
            break;
        case 'type':
            newImportDetails.type = value as ImportType;
            switch (newImportDetails.type) {
                case ImportType.INCOME:
                    newImportDetails.location = IncomeImportTypes.cryptoID;
                break;
                default:
            }
            break;
        case 'subtype':
            newImportDetails.subtype = value as TransactionImportType;
            break;
        default:
            newImportDetails[key] = value;
            break;
    }

    setImportDetails(newImportDetails);
}

const onAddTrade = (
    processedData: ITrade[],
    setProcessedData: (processedDataa: ITrade[]) => void,
    setShowAddTrade: (showAddTrade: boolean) => void
) => (trade: ITrade) => {
    const newTrades = processedData as ITrade[];
    newTrades.push(trade);
    setProcessedData(newTrades);
    setShowAddTrade(false);
};

const onAddIncome = (
    processedData: IIncome[],
    setProcessedData: (processedDataa: IIncome[]) => void,
    setShowNewIncome: (showNewIncome: boolean) => void
) => (income: IIncome) => {
    const newIncomes = processedData as IIncome[];
    newIncomes.push(income);
    setProcessedData(newIncomes);
    setShowNewIncome(false);
};

const updateDuplicateStatus = (duplicateData: DuplicateDataTypes, setDuplicateData: (duplicateData: DuplicateDataTypes) => void) => (tradeID: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = (duplicateData as IDuplicate[]).findIndex((trade) => trade.ID === tradeID);
    const newDuplicateData: IDuplicate[] = duplicateData;
    newDuplicateData[id].duplicate = e.currentTarget.checked;
    setDuplicateData(newDuplicateData as DuplicateDataTypes);
}

const readFile = (
    importDetails: IImport,
    savedData: ISavedData,
    setFileBrowseOpen: (fileBrowseOpen: boolean) => void,
    setProcessing: (processing: boolean) => void,
    setDuplicateData: (duplicateData: DuplicateDataTypes) => void,
    setAlertData: (alertData: IAlertData) => void,
    setProcessedData: (processedData: ProcessedDataTypes) => void,
) => async (
    fileData: string,
    input: React.RefObject<HTMLInputElement>
) => {
    setFileBrowseOpen(false);
    if (input.current !== null && input.current.files !== null && 0 in input.current.files) {
        // eslint-disable-next-line
        if (input.current.files[0].name.match('.+(\.csv)$')) {
            if (fileData !== '') {
                setProcessing(false);
                const processedData = await processData({
                    ...importDetails,
                    data: fileData,
                });
                if (processedData && processedData.length) {
                    const duplicateData = duplicateCheck(
                        importDetails, savedData, processedData,
                    );
                    if ((duplicateData as IDuplicate[]).some((data) => data.probability !== 0)) {
                        setDuplicateData(duplicateData);
                        setAlertData({
                            message: 'Duplicate Trades Detected',
                            type: AlertType.WARNING,
                        });
                    } else {
                        setProcessedData(processedData)
                    }
                    setProcessing(false);
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

export default Import;
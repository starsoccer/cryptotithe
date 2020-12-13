import * as React from 'react';
import { createEmptySavedData } from '../src/mock';
import save from '../src/save';
import savedDataConverter from '../src/savedDataConverter';
import {
    IPartialSavedData,
    ISavedData,
    ITradeWithDuplicateProbability,
} from '@types';
import integrityCheck from '@utils/integrityCheck';
import Button from '@components/Button';
import { FileBrowse } from '@components/FileBrowse';
import { FileDownload, IFileDownloadProps } from '@components/FileDownload';
import Popup from '@components/Popup';
import { CalculateGainsTab } from '@components/Tabs/CalculateGainsTab';
import { ImportDataTab } from '@components/Tabs/ImportDataTab';
import { PortfolioTab } from '@components/Tabs/PortfolioTab';
import { UtilityTab } from '@components/Tabs/UtilityTab';
import { ViewTradesTab } from '@components/Tabs/ViewTradesTab';
import CalculateIncomes from '@components/Tabs/CalculateIncomesTab';
import SavedDataConext from '@contexts/savedData';
import Header from '@components/Header';

export interface IAppProps {
    savedData: ISavedData;
    browser: boolean;
}

export enum TABS {
    Home = 'HOME',
    'View Trades' = 'VIEW_TRADES',
    'Import Data' = 'IMPORT_DATA',
    'Calculate Gains' = 'CALCULATE_GAINS',
    'Calculate Incomes' = 'CALCULATE_INCOMES',
    Utility = 'UTILITY',
}

interface IAppState {
    savedData: ISavedData;
    processing: boolean;
    duplicateTrades: ITradeWithDuplicateProbability[];
    currentTab: TABS;
    loadDataPopup: boolean;
    fileBrowseOpen: boolean;
    downloadProps: IFileDownloadProps;
    settingsPopup: boolean;
}

const isSavedDataLoaded = (data: ISavedData) => data && data.trades.length + Object.keys(data.holdings).length > 0;

export default class rootElement extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);

        const showLoadDataPopup = true || props.browser || !isSavedDataLoaded(props.savedData);

        this.state = {
            processing: false,
            duplicateTrades: [],
            currentTab: TABS.Home,
            fileBrowseOpen: false,
            loadDataPopup: showLoadDataPopup,
            downloadProps: {
                data: '',
                fileName: 'data.json',
                download: false,
            },
            settingsPopup: false,
            savedData: showLoadDataPopup ? createEmptySavedData() : props.savedData,
        };
    }

    public componentDidMount() {
        if (isSavedDataLoaded(this.props.savedData)) {
            this.loadData(this.props.savedData);
        }
    }

    public saveData = async (data: IPartialSavedData): Promise<boolean> => {
        const savedData = save(data, this.state.savedData);
        try {
            this.setState({
                downloadProps: {
                    data: JSON.stringify(savedData),
                    fileName: 'data.json',
                    download: true,
                },
                savedData,
            });
            return true;
        } catch (err) {
            alert(err);
            return false;
        }
    }

    public componentDidUpdate() {
        if (this.state.downloadProps.download) {
            this.setState({
                downloadProps: {
                    data: '',
                    fileName: 'data.json',
                    download: false,
                },
            });
        }
    }

    public showCurrentTab = (currentTab: TABS) => {
        switch (currentTab) {
            case TABS['Import Data']:
                return <ImportDataTab
                    savedData={this.state.savedData}
                    save={this.saveData}
                />;
            case TABS['View Trades']:
                return <ViewTradesTab savedData={this.state.savedData} save={this.saveData}/>;
            case TABS['Calculate Gains']:
                return <CalculateGainsTab savedData={this.state.savedData}/>;
            case TABS['Calculate Incomes']:
                return <CalculateIncomes savedData={this.state.savedData} />;
            case TABS.Utility:
                return <UtilityTab savedData={this.state.savedData} save={this.saveData}/>;
            case TABS.Home:
            default:
                return <PortfolioTab savedData={this.state.savedData} save={this.saveData}/>;
        }
    }

    public updateTab = (newTab: TABS) => {
        this.setState({currentTab: newTab});
    }

    public changePopupState = () => {
        this.setState({loadDataPopup: !this.state.loadDataPopup});
    }

    public parseData = (data: string) => {
        if (data !== '') {
            try {
                const parsedData: ISavedData = JSON.parse(data);
                this.loadData(parsedData);
            } catch (ex) {
                alert('Unable to parse saved data');
            }
        }
    }

    public loadData = (data: ISavedData) => {
        this.setState({fileBrowseOpen: false});
        const savedData = data;
        if (isSavedDataLoaded(savedData)) {
            if ('integrity' in savedData && integrityCheck(savedData) !== savedData.integrity) {
                alert('Integrity Check Failed. Your save file might be corrupt or tampered with.');
            }
            const shouldSave = savedDataConverter(savedData);
            if (shouldSave) {
                this.saveData(savedData);
            }
            this.setState({
                savedData,
                loadDataPopup: false,
            });
        }

    }

    public openFileBrowse = () => {
        this.setState({fileBrowseOpen: true});
    }

    public settingsPopup = () => {
        this.setState({settingsPopup: !this.state.settingsPopup});
    }

    public createNewSave = () => {
        this.setState({
            savedData: createEmptySavedData(),
            loadDataPopup: false,
        });
    }

    public render() {
        return (
            <SavedDataConext.Provider value={{
                save: this.saveData,
                savedData: this.state.savedData,
            }}>
                <div className='app'>
                    {this.state.loadDataPopup &&
                        <Popup onClose={this.changePopupState}>
                            <div>
                                <h1>Welcome to CryptoTithe</h1>
                                <h5>Great Description to be put here</h5>
                                <Button label='Load Existing Data' onClick={this.openFileBrowse}/>
                                <Button label='Create Save Data' onClick={this.createNewSave}/>
                                <FileBrowse
                                    onLoaded={this.parseData}
                                    browse={this.state.fileBrowseOpen}
                                />
                            </div>
                        </Popup>
                    }
                    { this.state.downloadProps &&
                        <FileDownload
                            data={this.state.downloadProps.data}
                            fileName={this.state.downloadProps.fileName}
                            download={this.state.downloadProps.download}
                        />
                    }
                    <Header
                        onSettingsClick={this.settingsPopup}
                        onUpdateTab={this.updateTab}
                        currentTab={this.state.currentTab}
                        showSettingsPopup={this.state.settingsPopup}
                        save={this.saveData}
                    />
                    {!this.state.loadDataPopup &&
                        <div className='openTab'>
                            {this.showCurrentTab(this.state.currentTab)}
                        </div>
                    }
                </div>
            </SavedDataConext.Provider>
        );
    }
}

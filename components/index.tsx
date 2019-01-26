import * as classnames from 'classnames';
import * as React from 'react';
import integrityCheck from '../src/utils/integrityCheck';
import save from '../src/save';
import { createEmptySavedData } from '../src/mock';
import savedDataConverter from '../src/savedDataConverter';
import {
    IPartialSavedData,
    ISavedData,
    ITradeWithDuplicateProbability,
} from '../src/types';
import Button from './Button';
import { FileBrowse } from './FileBrowse';
import { FileDownload, IFileDownloadProps } from './FileDownload';
import Popup from './Popup';
import { AddTradesTab } from './Tabs/AddTradesTab';
import { CalculateGainsTab } from './Tabs/CalculateGainsTab';
import { PortfolioTab } from './Tabs/PortfolioTab';
import { Settings } from './Tabs/Settings';
import { UtilityTab } from './Tabs/UtilityTab';
import { ViewTradesTab } from './Tabs/ViewTradesTab';

export interface IAppProps {
    savedData: ISavedData;
    browser: boolean;
}

enum TABS {
    Home = 'HOME',
    'View Trades' = 'VIEW_TRADES',
    'Add Trades' = 'ADD_TRADES',
    'Calculate Gains' = 'CALCULATE_GAINS',
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

const isSavedDataLoaded = (data: ISavedData) => data.trades.length + Object.keys(data.holdings).length > 0;

export class rootElement extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);
        this.state = {
            processing: false,
            duplicateTrades: [],
            currentTab: TABS.Home,
            fileBrowseOpen: false,
            loadDataPopup: props.browser || isSavedDataLoaded(props.savedData),
            downloadProps: {
                data: '',
                fileName: 'data.json',
                download: false,
            },
            settingsPopup: false,
            savedData: createEmptySavedData(),
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
            case TABS['Add Trades']:
                return <AddTradesTab
                    savedData={this.state.savedData}
                    save={this.saveData}
                />;
            case TABS['View Trades']:
                return <ViewTradesTab savedData={this.state.savedData} save={this.saveData}/>;
            case TABS['Calculate Gains']:
                return <CalculateGainsTab savedData={this.state.savedData}/>;
            case TABS.Utility:
                return <UtilityTab savedData={this.state.savedData} save={this.saveData}/>;
            case TABS.Home:
            default:
                return <PortfolioTab savedData={this.state.savedData} save={this.saveData}/>;
        }
    }

    public updateTab = (newTab: TABS) => () => {
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
                alert('Integrity Check Failed');
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

    public render() {
        return (
            <div className='app'>
                {this.state.loadDataPopup &&
                    <Popup onClose={this.changePopupState}>
                        <div>
                            <h1>Welcome to CryptoTithe</h1>
                            <h5>Great Description to be put here</h5>
                            <Button label='Load Existing Data' onClick={this.openFileBrowse}/>
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
                { this.state.settingsPopup &&
                    <Settings
                        settings={this.state.savedData.settings}
                        onSettingsSave={this.saveData}
                        onClose={this.settingsPopup}
                    />
                }
                <i className='fa fa-cog fa-2x moon-gray fr pr1 bg-dark-gray' onClick={this.settingsPopup}/>
                <div className='flex bg-dark-gray h2'>
                    {Object.keys(TABS).map((key: string) => <h3
                        key={key}
                        className={classnames('pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0', {
                            'bg-dark-gray': TABS[key] !== this.state.currentTab,
                            'bg-navy': TABS[key] === this.state.currentTab,
                        })}
                        onClick={this.updateTab(TABS[key])}
                    >{key}</h3>)}
                </div>
                {!this.state.loadDataPopup && isSavedDataLoaded(this.state.savedData) &&
                    <div className='openTab'>
                        {this.showCurrentTab(this.state.currentTab)}
                    </div>
                }
            </div>
        );
    }
}

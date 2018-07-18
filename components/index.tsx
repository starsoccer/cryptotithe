import * as classnames from 'classnames';
import * as React from 'react';
import SortTrades from '../src/processing/SortTrades';
import {
    IPartialSavedData,
    ISavedData,
    ITradeWithDuplicateProbability,
    ITradeWithUSDRate,
} from '../src/types';
import { AddTrades } from './AddTrades';
import Button from './Button';
import { CalculateGains } from './CalculateGains';
import { FileBrowse } from './FileBrowse';
import { FileDownload, IFileDownloadProps } from './FileDownload';
import Popup from './Popup';
import { ViewTrades } from './ViewTrades';
import { Settings } from './Settings';
import { AdvancedTab } from './AdvancedTab';

export interface IAppProps {
    savedData: ISavedData;
    browser: boolean;
}

enum TABS {
    HOME = 'Home',
    VIEW_TRADES = 'View Trades',
    ADD_TRADES = 'Add Trades',
    CALCULATE_GAINS = 'Calculate Gains',
    ADVANCED = 'Advanced',
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

export class rootElement extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);
        this.state = {
            processing: false,
            duplicateTrades: [],
            currentTab: TABS.HOME,
            fileBrowseOpen: false,
            loadDataPopup: props.browser || props.savedData.trades.length + Object.keys(props.savedData.holdings).length === 0,
            downloadProps: {
                data: '',
                fileName: 'data.json',
                download: false,
            },
            settingsPopup: false,
            savedData: props.savedData,
        };
    }

    public saveData = async (data: IPartialSavedData): Promise<boolean> => {
        const newHoldings = data.holdings || this.state.savedData.holdings;
        const newTrades = data.trades || this.state.savedData.trades;
        const newSettings = data.settings || this.state.savedData.settings;
        try {
            const savedData: ISavedData = {
                savedDate: new Date(),
                trades: SortTrades(newTrades) as ITradeWithUSDRate[],
                holdings: newHoldings,
                settings: newSettings,
            };
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
            case TABS.ADD_TRADES:
                return <AddTrades
                    savedData={this.state.savedData}
                    save={this.saveData}
                />;
            case TABS.VIEW_TRADES:
                return <ViewTrades savedData={this.state.savedData} save={this.saveData}/>;
            case TABS.CALCULATE_GAINS:
                return <CalculateGains savedData={this.state.savedData}/>;
            case TABS.ADVANCED:
                return <AdvancedTab savedData={this.state.savedData}/>;
            case TABS.HOME:
                return ;
            default:
                return ;
        }
    }

    public updateTab = (newTab: TABS) => () => {
        this.setState({currentTab: newTab});
    }

    public changePopupState = () => {
        this.setState({loadDataPopup: !this.state.loadDataPopup});
    }

    public loadData = (data: string) => {
        this.setState({fileBrowseOpen: false});
        if (data !== '') {
            try {
                const parsedData: ISavedData = JSON.parse(data);
                this.setState({
                    savedData: parsedData,
                    loadDataPopup: false,
                });
            } catch (ex) {
                alert('Unable to parse saved data');
            }
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
                                onLoaded={this.loadData}
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
                <link rel='stylesheet' type='text/css' href='./components/index.css' />
                <i className="fa fa-cog fa-2x moon-gray fr pr1 bg-dark-gray" onClick={this.settingsPopup}/>
                <div className='flex bg-dark-gray h2'>
                    {Object.keys(TABS).map((key: string) => <h3
                        key={key}
                        className={classnames('pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0', {
                            'bg-dark-gray': TABS[key] !== this.state.currentTab,
                            'bg-navy': TABS[key] === this.state.currentTab,
                        })}
                        onClick={this.updateTab(TABS[key])}
                    >{TABS[key]}</h3>)}
                </div>
                <div className='openTab'>
                    {this.showCurrentTab(this.state.currentTab)}
                </div>
            </div>
        );
    }
}

import * as React from 'react';
import { createEmptySavedData } from '../src/mock';
import savedDataConverter from '../src/savedDataConverter';
import {
    IPartialSavedData,
    ISavedData,
    ITradeWithDuplicateProbability,
} from '@types';
import integrityCheck from '@utils/integrityCheck';
import Button from '@components/Button';
import { FileBrowse } from '@components/FileBrowse';
import Popup from '@components/Popup';
import { CalculateGainsTab } from '@components/Tabs/CalculateGainsTab';
import { ImportDataTab } from '@components/Tabs/ImportDataTab';
import { UtilityTab } from '@components/Tabs/UtilityTab';
import CalculateIncomes from '@components/Tabs/CalculateIncomesTab';

export interface IAppProps {
    savedData: ISavedData;
    updateSaveData: (data: IPartialSavedData, shouldDownload?: boolean) => Promise<boolean>;
    browser: boolean;
    currentTab: TABS;
}

export enum TABS {
    'Import Data' = 'IMPORT_DATA',
    'Calculate Gains' = 'CALCULATE_GAINS',
    'Calculate Incomes' = 'CALCULATE_INCOMES',
    Utility = 'UTILITY',
}

interface IAppState {
    processing: boolean;
    duplicateTrades: ITradeWithDuplicateProbability[];
    loadDataPopup: boolean;
    fileBrowseOpen: boolean;
}

const isSavedDataLoaded = (data: ISavedData) => data && data.trades.length + Object.keys(data.holdings).length > 0;

export default class rootElement extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);

        this.state = {
            processing: false,
            duplicateTrades: [],
            fileBrowseOpen: false,
            loadDataPopup: true,
            downloadProps: {
                data: '',
                fileName: 'data.json',
                download: false,
            },
        };
    }

    public componentDidMount() {
        if (isSavedDataLoaded(this.props.savedData)) {
            this.loadData(this.props.savedData);
        }
    }

    public showCurrentTab = (currentTab: TABS) => {
        switch (currentTab) {
            case TABS['Import Data']:
                return <ImportDataTab
                    savedData={this.props.savedData}
                    save={this.props.updateSaveData}
                />;
            case TABS['Calculate Gains']:
                return <CalculateGainsTab savedData={this.props.savedData}/>;
            case TABS['Calculate Incomes']:
                return <CalculateIncomes savedData={this.props.savedData} />;
            case TABS.Utility:
                return <UtilityTab savedData={this.props.savedData} save={this.props.updateSaveData}/>;
        }
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
                console.log(ex);
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
            this.props.updateSaveData(savedData, shouldSave);
            this.setState({
                loadDataPopup: false,
            });
        }

    }

    public openFileBrowse = () => {
        this.setState({fileBrowseOpen: true});
    }

    public createNewSave = () => {
        this.props.updateSaveData(createEmptySavedData());
        this.setState({
            loadDataPopup: false,
        });
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
                            <Button label='Create Save Data' onClick={this.createNewSave}/>
                            <FileBrowse
                                onLoaded={this.parseData}
                                browse={this.state.fileBrowseOpen}
                            />
                        </div>
                    </Popup>
                }
                {!this.state.loadDataPopup &&
                    <div className='openTab'>
                        {this.showCurrentTab(this.props.currentTab)}
                    </div>
                }
            </div>
        );
    }
}

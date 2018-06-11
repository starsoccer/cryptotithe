import * as classnames from 'classnames';
import * as React from 'react';
import { processData } from '../src/parsers';
import duplicateCheck from '../src/processing/DuplicateCheck';
import { save } from '../src/save';
import { EXCHANGES, IHoldings, ITrade, ITradeWithDuplicateProbability } from '../src/types';
import { AddTrades } from './AddTrades';

export interface IAppProps {
    trades: ITrade[];
    holdings: IHoldings;
}

enum TABS {
    HOME = 'Home',
    VIEW_TRADES = 'View Trades',
    ADD_TRADES = 'Add Trades',
}

interface IAppState {
    trades: ITrade[];
    processing: boolean;
    holdings: IHoldings;
    duplicateTrades: ITradeWithDuplicateProbability[];
    currentTab: TABS;
}

export class rootElement extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = {
            trades: this.props.trades,
            holdings: this.props.holdings,
            processing: false,
            duplicateTrades: [],
            currentTab: TABS.ADD_TRADES,
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
            const duplicateTrades = duplicateCheck(this.state.trades, processedData);
            if (duplicateTrades.length) {
                this.setState({duplicateTrades});
            } else {
                this.setState({
                    trades: processedData,
                    processing: false,
                });
            }
        } else {
            alert('Error processing data');
        }
    }

    public saveData = async (): Promise<void> => {
        try {
            await save(this.state.holdings, this.state.trades);
        } catch (err) {
            alert(err);
        }
    }

    public showCurrentTab = (currentTab: TABS) => {
        switch (currentTab) {
            case TABS.ADD_TRADES:
                return <AddTrades holdings={this.state.holdings}/>;
            case TABS.VIEW_TRADES:
                return ;
            case TABS.HOME:
                return ;
            default:
                return ;
        }
    }

    public updateTab = (newTab: TABS) => () => {
        this.setState({currentTab: newTab});
    }

    public render() {
        return (
            <div className='app'>
                <div className='flex bg-dark-gray h2 mb2'>
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

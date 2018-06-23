import * as classnames from 'classnames';
import * as React from 'react';
import { save } from '../src/save';
import {
    IHoldings,
    IPartialSavedData,
    ITradeWithUSDRate,
    ITradeWithDuplicateProbability
} from '../src/types';
import { AddTrades } from './AddTrades';
import { CalculateGains } from './CalculateGains';
import { ViewTrades } from './ViewTrades';

export interface IAppProps {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
}

enum TABS {
    HOME = 'Home',
    VIEW_TRADES = 'View Trades',
    ADD_TRADES = 'Add Trades',
    CALCULATE_GAINS = 'Calculate Gains',
}

interface IAppState {
    trades: ITradeWithUSDRate[];
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

    public saveData = async (data: IPartialSavedData): Promise<boolean> => {
        const newHoldings = data.holdings || this.state.holdings;
        const newTrades = data.trades || this.state.trades;

        try {
            await save(newHoldings, newTrades);
            this.setState({
                trades: newTrades,
                holdings: newHoldings,
            });
            return true;
        } catch (err) {
            alert(err);
            return false;
        }
    }

    public showCurrentTab = (currentTab: TABS) => {
        switch (currentTab) {
            case TABS.ADD_TRADES:
                return <AddTrades
                    holdings={this.state.holdings}
                    trades={this.state.trades}
                    save={this.saveData}
                />;
            case TABS.VIEW_TRADES:
                return <ViewTrades holdings={this.state.holdings} trades={this.state.trades} save={this.saveData}/>;
            case TABS.CALCULATE_GAINS:
                return <CalculateGains trades={this.state.trades} holdings={this.state.holdings}/>
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
                <link rel='stylesheet' type='text/css' href='./components/index.css' />
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

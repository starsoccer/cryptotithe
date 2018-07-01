import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { rootElement } from './components';
// import { save } from './src/save';
import { IHoldings, ITradeWithUSDRate, ISavedData } from './src/types';

export interface IBootStrapData {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
    browser: boolean;
}

function render(trades: ITradeWithUSDRate[], holdings: IHoldings, browser: boolean) {
    ReactDOM.render(
        React.createElement(rootElement, {
            trades,
            holdings,
            browser,
        }),
        document.getElementById('cryptotithe'),
    );
}

const isElectron = require('is-electron');
const electron = isElectron();
if (electron) {
    try {
        const data: ISavedData = require('./data');
        render(data.trades, data.holdings, false);
    } catch (ex) {
        render([], {}, false);
    }
} else {
    render([], {}, true);
}

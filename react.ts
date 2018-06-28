import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { rootElement } from './components';
// import { save } from './src/save';
import { IHoldings, ITradeWithUSDRate } from './src/types';

export interface IBootStrapData {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
    browser: boolean;
}

function bootstrap(): IBootStrapData {
    const isElectron = require('is-electron');
    const browser = isElectron();
    if (!browser) {
        return {
            browser: true,
            trades: [],
            holdings: {},
        };
    } else {
        const savedData = require('./data.json');
        return {
            browser: false,
            trades: savedData.trades || [],
            holdings: savedData.holdings || {},
        };
    }
}

const data = bootstrap();

ReactDOM.render(
    React.createElement(rootElement, {
        trades: data.trades,
        holdings: data.holdings,
        browser: data.browser,
    }),
    document.getElementById('cryptotithe'),
);

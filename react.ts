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
    const electron = isElectron();
    if (electron) {
        try {
            const savedData = require('./data.json');
            return {
                browser: false,
                trades: savedData.trades || [],
                holdings: savedData.holdings || {},
            };
        } catch (ex) {
            // couldnt load json file
        }
    }
    return {
        browser: !electron,
        trades: [],
        holdings: {},
    };
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

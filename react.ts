import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { rootElement } from './components';
import { FiatRateMethod, ISavedData } from './src/types';

function createEmptySavedData(): ISavedData {
    return {
        trades: [],
        holdings: {},
        savedDate: new Date(),
        settings: {
            fiatRateMethod: Object.keys(FiatRateMethod)[0] as keyof typeof FiatRateMethod,
            fiatCurrency: 'USD',
        },
    };
}

function render(browser: boolean, savedData = createEmptySavedData()) {
    ReactDOM.render(
        React.createElement(rootElement, {
            savedData,
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
        render(false, data);
    } catch (ex) {
        render(false);
    }
} else {
    render(true);
}

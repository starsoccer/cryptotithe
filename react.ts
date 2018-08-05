import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { rootElement } from './components';
import { createEmptySavedData } from './src/mock';
import { ISavedData } from './src/types';

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

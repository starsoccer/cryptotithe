const React = require('react');
const ReactDOM = require('react-dom');
import path = require('path');
import { rootElement } from './components';
import { save } from './src/save';
import { EXCHANGES, IHoldings, ISavedData, ITradeWithUSDRate } from './src/types';
let savedData: ISavedData = {
    holdings: {},
    savedDate: undefined,
    trades: [],
};
try {
    savedData = require('./data.json');
} catch (ex) {
    alert('Welcome First Time User');
    save(savedData.holdings, savedData.trades);
}
const trades: ITradeWithUSDRate[] = savedData.trades;
const holdings: IHoldings = savedData.holdings;

ReactDOM.render(
    React.createElement(rootElement, {
        trades,
        holdings,
        test: 'test',
    }),
    document.getElementById('cryptotithe'),
);

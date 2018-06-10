// const React = require('react');
import * as React from 'react';
import { r } from '../src/react';
import { save } from '../src/save';
import { EXCHANGES, IHoldings, ISavedData, ITradeWithUSDRate } from '../src/types';
export interface IrootElementProps {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
}

export class rootElement extends React.Component<IrootElementProps> {
    public render() {
        return (
            r('div', {},
                r('h1', { className: 'tc' }, 'Crypto Tithe'),
                r('hr', {}),
                r('div', { className: 'center tc' },
                    r('label', { htmlFor: 'type', className: 'pr2' }, 'Import Type'),
                    r('select', { name: 'type', id: 'type' },
                        Object.keys(EXCHANGES).map((key) => r(
                            'option', { key, value: key }, EXCHANGES[key],
                        )),
                    ),
                ),
                r('div', { className: 'flex justify-around pt2' },
                    r('button', { onClick: onSubmit }, 'Process Data'),
                    r('button', { onClick: saveData }, 'Save'),
                ),
            )
        );
    }
}

function onSubmit(): void {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog({properties: ['openFile']}, fileSelected);
}

function fileSelected(filePaths: string[]): void {
    const exchange: keyof typeof EXCHANGES = (document.getElementById('type') as HTMLSelectElement)
        .value as keyof typeof EXCHANGES;
    const processData: (exchange: keyof typeof EXCHANGES, path: string) => any = require('./src/parsers').processData;
    const processedData: any = processData(exchange, filePaths[0]);
    if (processedData) {
        // do something
    }
}

async function saveData(): Promise<void> {
    // const save = require('/src/save').save;
    try {
        // await save(holdings, trades);
    } catch (err) {
        alert(err);
    }
}

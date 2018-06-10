// const React = require('react');
import * as React from 'react';
import { save } from '../src/save';
import { EXCHANGES, IHoldings, ITradeWithUSDRate } from '../src/types';
import { Button } from './Button';
export interface IrootElementProps {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
}

export class rootElement extends React.Component<IrootElementProps> {
    public render() {
        return (
            <div>
                <h1 className='tc'>Crypto Tithe</h1>
                <hr />
                <div className='center tc'>
                    <label htmlFor='type' className='pr2'>Import Type</label>
                    <select name='type' id='type'>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                </div>
                <div className='flex justify-around pt2'>
                    <Button onClick={onSubmit} label='Process Data'/>
                    <Button onClick={saveData} label='Save'/>
                </div>
            </div>
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
        await save({}, []);
    } catch (err) {
        alert(err);
    }
}

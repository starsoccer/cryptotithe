// const React = require('react');
import * as React from 'react';
import { processData } from '../src/parsers';
import { save } from '../src/save';
import { EXCHANGES, IHoldings, ITradeWithUSDRate } from '../src/types';
import { Button } from './Button';
import { TradesTable } from './TradesTable';
export interface IAppProps {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
}

interface IAppState {
    trades: ITradeWithUSDRate[];
    holdings: IHoldings;
}

export class rootElement extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = {
            trades: this.props.trades,
            holdings: this.props.holdings,
        };
    }

    public onSubmit = async (): Promise<void> => {
        const { dialog } = require('electron').remote;
        const filePaths = await dialog.showOpenDialog({properties: ['openFile']});
        const exchange: keyof typeof EXCHANGES = (document.getElementById('type') as HTMLSelectElement)
            .value as keyof typeof EXCHANGES;
        const processedData: ITradeWithUSDRate[] = await processData(exchange, filePaths[0]);
        if (processedData) {
            this.setState({
                trades: processedData,
            });
        }
    }

    public saveData = async (): Promise<void> => {
        try {
            await save(this.state.holdings, this.state.trades);
        } catch (err) {
            alert(err);
        }
    }

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
                    <Button onClick={this.onSubmit} label='Process Data'/>
                    <Button onClick={this.saveData} label='Save'/>
                </div>
                <TradesTable trades={this.state.trades}/>
            </div>
        );
    }
}

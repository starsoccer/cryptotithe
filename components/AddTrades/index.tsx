// const React = require('react');
import * as React from 'react';
import { processData } from '../../src/parsers';
import duplicateCheck from '../../src/processing/DuplicateCheck';
import sortTrades from '../../src/processing/SortTrades';
import { save } from '../../src/save';
import { EXCHANGES, IHoldings, ITrade, ITradeWithDuplicateProbability } from '../../src/types';
import { AlertBar } from '../AlertBar';
import { Button } from '../Button';
import { DuplicateTradesTable } from '../DuplicateTradesTable';
import { Loader } from '../Loader';
import { TradesTable } from '../TradesTable';
export interface IAddTradesProp {
    holdings: IHoldings;
    trades: ITrade[];
}

interface IAddTradesState {
    currentTrades: ITrade[];
    processedTrades: ITrade[];
    processing: boolean;
    holdings: IHoldings;
    duplicateTrades: ITradeWithDuplicateProbability[];
    duplicateWarning: boolean;
}

export class AddTrades extends React.Component<IAddTradesProp, IAddTradesState> {
    constructor(props: IAddTradesProp) {
        super(props);
        this.state = {
            processedTrades: [],
            currentTrades: this.props.trades,
            holdings: this.props.holdings,
            processing: false,
            duplicateTrades: [],
            duplicateWarning: false,
        };
    }

    public onSubmit = async (): Promise<void> => {
        this.setState({processing: true});
        const { dialog } = require('electron').remote;
        const filePaths = await dialog.showOpenDialog({properties: ['openFile']});
        const exchange: keyof typeof EXCHANGES = (document.getElementById('type') as HTMLSelectElement)
            .value as keyof typeof EXCHANGES;
        const processedData: ITrade[] = await processData(exchange, filePaths[0]);
        if (processedData && processedData.length) {
            const duplicateTrades = duplicateCheck(this.state.currentTrades, processedData);
            if (duplicateTrades.length) {
                this.setState({
                    duplicateTrades,
                    duplicateWarning: true,
                    processing: false,
                });
            } else {
                this.setState({
                    processedTrades: processedData,
                    processing: false,
                });
            }
        } else {
            alert('Error processing data');
        }
    }

    public saveData = async (): Promise<void> => {
        const duplicateToSave = this.state.duplicateTrades.filter((trade) => trade.duplicate);
        const newTrades = sortTrades(
            this.state.currentTrades.concat(duplicateToSave).concat(this.state.processedTrades)
        );
        try {
            await save(this.state.holdings, newTrades);
            this.setState({currentTrades: newTrades});
        } catch (err) {
            alert(err);
        }
    }

    public dismissDuplicateWarning = () => {
        this.setState({duplicateWarning: false});
    }

    public duplicateStatusChange = (tradeID: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = this.state.duplicateTrades.findIndex((trade) => trade.id === tradeID);
        const newDuplicateTrades = this.state.duplicateTrades;
        newDuplicateTrades[id].duplicate = e.currentTarget.checked;
        this.setState({duplicateTrades: newDuplicateTrades});
    }

    public render() {
        return (
            <div className='addTrades'>
                {this.state.duplicateWarning &&
                    <AlertBar message='Duplicate Trades Detected' onClick={this.dismissDuplicateWarning}/>
                }
                <div className='center tc mt2'>
                    <label htmlFor='type' className='pr2'>Import Type</label>
                    <select name='type' id='type'>
                        {Object.keys(EXCHANGES).map((key) =>
                            <option key={key} value={key}>{EXCHANGES[key as keyof typeof EXCHANGES]}</option>,
                        )}
                    </select>
                </div>
                <div className='flex justify-around pt2'>
                    <Button onClick={this.onSubmit} label='Load Trades'/>
                    <Button onClick={this.saveData} label='Save'/>
                </div>
                {this.state.duplicateTrades.length > 0 &&
                    <DuplicateTradesTable
                        trades={this.state.duplicateTrades}
                        duplicateChange={this.duplicateStatusChange}
                    />
                }
                {this.state.processedTrades.length > 0 && <TradesTable trades={this.state.processedTrades}/>}
                {this.state.processedTrades.length === 0 && this.state.processing &&
                    <Loader />
                }
            </div>
        );
    }
}

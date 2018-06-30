import * as React from 'react';
import generateForm8949 from '../../src/output/Form8949';
import { calculateGainPerTrade } from '../../src/processing/CalculateGains';
import { IHoldings, ITradeWithGains, ITradeWithUSDRate } from '../../src/types';
// import { AlertBar, AlertType } from '../AlertBar';
import Button from '../Button';
import { FileDownload, IFileDownloadProps } from '../FileDownload';
import { GainsPerTradeTable } from '../GainsPerTradeTable';
// import { Loader } from '../Loader';
export interface ICalculateTradesProp {
    holdings: IHoldings;
    trades: ITradeWithUSDRate[];
}

export interface ICalculateTradesState {
    tradeGains: ITradeWithGains[];
    filteredTradesWithGains?: ITradeWithGains[];
    longTermGains: number;
    shortTermGains: number;
    years: string[];
    downloadProps: IFileDownloadProps;
}

export class CalculateGains extends React.Component<ICalculateTradesProp, ICalculateTradesState> {
    public constructor(props: ICalculateTradesProp) {
        super(props);
        const trades = calculateGainPerTrade(props.holdings, props.trades);
        let shortTermGains = 0;
        let longTermGains = 0;
        const years: string[] = ['----'];
        trades.forEach((trade) => {
            shortTermGains += trade.shortTerm;
            longTermGains += trade.longTerm;
            const year = new Date(trade.date).getFullYear();
            if (years.indexOf(year.toString()) === -1) {
                years.push(year.toString());
            }
        });
        this.state = {
            tradeGains: trades,
            longTermGains,
            shortTermGains,
            years,
            downloadProps: {
                fileName: '',
                data: '',
                download: false,
            },
        };
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'year':
                const newTrades = (e.currentTarget.value === '----' ?
                    this.state.tradeGains :
                    this.state.tradeGains.filter(
                        (trade) => new Date(trade.date).getFullYear().toString() === e.currentTarget.value,
                    )
                );
                let shortTermGains = 0;
                let longTermGains = 0;
                newTrades.forEach((trade) => {
                    shortTermGains += trade.shortTerm;
                    longTermGains += trade.longTerm;
                });
                this.setState({
                    filteredTradesWithGains: newTrades,
                    longTermGains,
                    shortTermGains,
                });
                break;
        }
    }

    public generateForm8949 = () => {
        const data = generateForm8949(this.props.holdings, this.state.tradeGains);
        this.setState({downloadProps: {
            data,
            fileName: 'Form8949.csv',
            download: true,
        }});
    }

    public render() {
        return (
            <div className='calculategains'>
                <div className='flex justify-center'>
                    <h3 className='pa2'>Short Term Gains: {this.state.shortTermGains}</h3>
                    <h3 className='pa2'>Long Term Gains: {this.state.longTermGains}</h3>
                </div>
                <div className='tc'>
                    <label>Year</label>
                    <select className='pl2' onChange={this.onChange('year')}>
                        {this.state.years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <Button label='Form 8949' onClick={this.generateForm8949}/>
                </div>
                { this.state.filteredTradesWithGains !== undefined && this.state.filteredTradesWithGains.length > 0 ?
                    <GainsPerTradeTable
                        trades={this.state.filteredTradesWithGains}
                    />
                :
                this.state.tradeGains !== undefined &&
                    <GainsPerTradeTable
                        trades={this.state.tradeGains}
                    />
                }
                <FileDownload
                    data={this.state.downloadProps.data}
                    fileName={this.state.downloadProps.fileName}
                    download={this.state.downloadProps.download}
                />
            </div>
        );
    }
}
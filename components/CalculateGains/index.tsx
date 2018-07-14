import * as React from 'react';
import generateForm8949 from '../../src/output/Form8949';
import { calculateGainPerTrade, calculateGains } from '../../src/processing/CalculateGains';
import { IHoldings, ITrade, ITradeWithGains, ITradeWithUSDRate, METHOD } from '../../src/types';
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
    includePreviousYears: boolean;
    currentYear: number;
    gainCalculationMethod: METHOD;
}

function getTradeYears(trades: ITrade[]) {
    const years: string[] = ['----'];
    trades.forEach((trade) => {
        const year = new Date(trade.date).getFullYear();
        if (years.indexOf(year.toString()) === -1) {
            years.push(year.toString());
        }
    });
    return years;
}

function recalculate(holdings: IHoldings, trades: ITradeWithUSDRate[], includePreviousYears: boolean, year: string) {
    if (year !== '----') {
        let newHoldings = holdings;
        if (includePreviousYears) {
            const pastTrades = trades.filter(
                (trade) => new Date(trade.date).getFullYear() < parseInt(year, 10),
            );
            newHoldings = calculateGains(holdings, pastTrades).newHoldings;
        }
        const newTrades = trades.filter(
            (trade) => new Date(trade.date).getFullYear().toString() === year,
        );
        return calculateGainPerTrade(newHoldings, newTrades);
    } else {
        return calculateGainPerTrade(holdings, trades);
    }
}

export class CalculateGains extends React.Component<ICalculateTradesProp, ICalculateTradesState> {
    public constructor(props: ICalculateTradesProp) {
        super(props);
        const result = calculateGainPerTrade(props.holdings, props.trades);
        this.state = {
            tradeGains: result.trades,
            longTermGains: result.longTerm,
            shortTermGains: result.shortTerm,
            years: getTradeYears(props.trades),
            includePreviousYears: true,
            downloadProps: {
                fileName: '',
                data: '',
                download: false,
            },
            currentYear: 0,
            gainCalculationMethod: METHOD.FIFO,
        };
    }

    public componentDidUpdate(_prevProps: ICalculateTradesProp, prevState: ICalculateTradesState)  {
        if (
            this.state.currentYear !== prevState.currentYear ||
            this.state.includePreviousYears !== prevState.includePreviousYears
        ) {
            const result = recalculate(
                this.props.holdings,
                this.props.trades,
                this.state.includePreviousYears,
                this.state.currentYear.toString(),
            );
            this.setState({
                filteredTradesWithGains: result.trades,
                longTermGains: result.longTerm,
                shortTermGains: result.shortTerm,
            });
        }
    }

    public onChangeCheckBox = () => (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({includePreviousYears: e.currentTarget.checked});
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'year':
                this.setState({
                    currentYear: parseInt(e.currentTarget.value, 10),
                });
                break;
            case 'gainCalculationMethod':
                this.setState({
                    gainCalculationMethod: e.currentTarget.value as METHOD,
                });
                break;
        }
    }

    public generateForm8949 = () => {
        let holdings = this.props.holdings;
        if (this.state.includePreviousYears) {
            const trades = this.props.trades.filter((trade) =>
                new Date(trade.date).getFullYear() < this.state.currentYear);
            holdings = calculateGains(this.props.holdings, trades).newHoldings;
        }
        const data = generateForm8949(holdings, this.state.tradeGains);
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
                    <label>Calculation Method</label>
                    <select className='pl2' onChange={this.onChange('gainCalculationMethod')}>
                        {Object.keys(METHOD).map((method) =>
                            <option key={method} value={METHOD[method]}>{method}</option>,
                        )}
                    </select>
                    <label>Include Previous Years</label>
                    <input
                        type='checkbox'
                        onChange={this.onChangeCheckBox()}
                        checked={this.state.includePreviousYears}
                    />
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

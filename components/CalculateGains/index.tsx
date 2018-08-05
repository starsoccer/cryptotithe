import * as React from 'react';
import generateForm8949 from '../../src/output/Form8949';
import { calculateGainPerTrade, calculateGains } from '../../src/processing/CalculateGains';
import { IHoldings, ISavedData, ITrade, ITradeWithFiatRate, ITradeWithGains, METHOD } from '../../src/types';
// import { AlertBar, AlertType } from '../AlertBar';
import Button from '../Button';
import { FileDownload, IFileDownloadProps } from '../FileDownload';
import { GainsPerTradeTable } from '../GainsPerTradeTable';
// import { Loader } from '../Loader';
import Customize from './Customize.component';
export interface ICalculateTradesProp {
    savedData: ISavedData;
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
    showCustomizeModal: boolean;
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

function recalculate(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    gainCalculationMethod: METHOD,
    includePreviousYears: boolean,
    year: string,
    fiatCurrnecy: string,
) {
    if (year !== '----') {
        let newHoldings = holdings;
        if (includePreviousYears) {
            const pastTrades = trades.filter(
                (trade) => new Date(trade.date).getFullYear() < parseInt(year, 10),
            );
            newHoldings = calculateGains(holdings, pastTrades, fiatCurrnecy).newHoldings;
        }
        const newTrades = trades.filter(
            (trade) => new Date(trade.date).getFullYear().toString() === year,
        );
        return calculateGainPerTrade(newHoldings, newTrades, fiatCurrnecy, gainCalculationMethod);
    } else {
        return calculateGainPerTrade(holdings, trades, fiatCurrnecy, gainCalculationMethod);
    }
}

export class CalculateGains extends React.Component<ICalculateTradesProp, ICalculateTradesState> {
    public constructor(props: ICalculateTradesProp) {
        super(props);
        const result = calculateGainPerTrade(
            props.savedData.holdings,
            props.savedData.trades,
            this.props.savedData.settings.fiatCurrency,
            METHOD.FIFO,
        );
        this.state = {
            tradeGains: result.trades,
            longTermGains: result.longTerm,
            shortTermGains: result.shortTerm,
            years: getTradeYears(props.savedData.trades),
            includePreviousYears: true,
            downloadProps: {
                fileName: '',
                data: '',
                download: false,
            },
            currentYear: 0,
            gainCalculationMethod: METHOD.FIFO,
            showCustomizeModal: false,
        };
    }

    public calculateGains = () => {
        const result = recalculate(
            this.props.savedData.holdings,
            this.props.savedData.trades,
            this.state.gainCalculationMethod,
            this.state.includePreviousYears,
            this.state.currentYear.toString(),
            this.props.savedData.settings.fiatCurrency,
        );
        this.setState({
            filteredTradesWithGains: result.trades,
            longTermGains: result.longTerm,
            shortTermGains: result.shortTerm,
            showCustomizeModal: false,
        });
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
        let holdings = this.props.savedData.holdings;
        if (this.state.includePreviousYears) {
            const trades = this.props.savedData.trades.filter((trade) =>
                new Date(trade.date).getFullYear() < this.state.currentYear);
            holdings = calculateGains(
                this.props.savedData.holdings, trades, this.state.gainCalculationMethod,
            ).newHoldings;
        }
        const tradesForThisYear: ITradeWithFiatRate[] = this.props.savedData.trades.filter(
            (trade) => new Date(trade.date).getFullYear() === this.state.currentYear,
        );
        const data = generateForm8949(
            holdings,
            tradesForThisYear,
            this.props.savedData.settings.fiatCurrency,
            this.state.gainCalculationMethod,
        );
        this.setState({downloadProps: {
            data,
            fileName: 'Form8949.csv',
            download: true,
        }});
    }

    public customizeModal = () => {
        this.setState({showCustomizeModal: !this.state.showCustomizeModal});
    }

    public render() {
        return (
            <div className='calculategains'>
                <div className='tc'>
                    <Button label='Customize' onClick={this.customizeModal}/>
                </div>
                <div className='flex justify-center'>
                    <h3 className='pa2'>Short Term Gains: {this.state.shortTermGains}</h3>
                    <h3 className='pa2'>Long Term Gains: {this.state.longTermGains}</h3>
                </div>
                { this.state.filteredTradesWithGains !== undefined && this.state.filteredTradesWithGains.length > 0 ?
                    <GainsPerTradeTable
                        fiatCurrency={this.props.savedData.settings.fiatCurrency}
                        trades={this.state.filteredTradesWithGains}
                    />
                :
                this.state.tradeGains !== undefined &&
                    <GainsPerTradeTable
                        fiatCurrency={this.props.savedData.settings.fiatCurrency}
                        trades={this.state.tradeGains}
                    />
                }
                <FileDownload
                    data={this.state.downloadProps.data}
                    fileName={this.state.downloadProps.fileName}
                    download={this.state.downloadProps.download}
                />
                {this.state.showCustomizeModal &&
                    <Customize
                        onClose={this.customizeModal}
                        onChange={this.onChange}
                        onChangeCheckbox={this.onChangeCheckBox}
                        onGenerate={this.calculateGains}
                        onForm8949Export={this.generateForm8949}
                        years={this.state.years}
                        selectedYear={this.state.currentYear}
                        selectedMethod={this.state.gainCalculationMethod}
                        includePreviousYears={this.state.includePreviousYears}
                    />
                }
            </div>
        );
    }
}

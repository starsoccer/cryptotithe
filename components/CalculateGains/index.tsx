import * as React from 'react';
import generateForm8949 from '../../src/output/Form8949';
import { calculateGainPerTrade, calculateGains } from '../../src/processing/CalculateGains';
import { IHoldings, ISavedData, ITrade, ITradeWithFiatRate, ITradeWithGains, METHOD } from '../../src/types';
// import { AlertBar, AlertType } from '../AlertBar';
import Button from '../Button';
import { FileDownload, IFileDownloadProps } from '../FileDownload';
import { GainsPerTradeTable } from '../GainsPerTradeTable';
// import { Loader } from '../Loader';
import { Customize, IYearCalculationMethod } from './Customize.component';
export interface ICalculateTradesProp {
    savedData: ISavedData;
}

export interface ICalculateTradesState {
    filteredTradesWithGains?: ITradeWithGains[];
    longTermGains?: number;
    shortTermGains?: number;
    years: string[];
    yearCalculationMethod: IYearCalculationMethod;
    downloadProps: IFileDownloadProps;
    currentYear: number;
    showCustomizeModal: boolean;
}

function getTradeYears(trades: ITrade[]) {
    const years: string[] = [];
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
    fiatCurrnecy: string,
    yearCalculationMethod: IYearCalculationMethod,
) {
    const years = Object.keys(yearCalculationMethod);
    let newHoldings = holdings;
    if (years.length !== 1) {
        for (let index = 0; index < years.length - 1; index++) {
            const pastTrades = trades.filter(
                (trade) => new Date(trade.date).getFullYear() === parseInt(years[index], 10),
            );
            const result = calculateGains(holdings, pastTrades, fiatCurrnecy, yearCalculationMethod[years[index]]);
            newHoldings = result.newHoldings;  
        }
    }
    const lastYear = years[years.length - 1];
    let newTrades = trades;
    if (lastYear !== '----' && lastYear !== '0') {
        newTrades = trades.filter(
            (trade) => new Date(trade.date).getFullYear().toString() === lastYear,
        );
    }
    return {
        holdings: newHoldings,
        trades: newTrades,
        gainCalculationMethod: yearCalculationMethod[lastYear],
    };
}

export class CalculateGains extends React.Component<ICalculateTradesProp, ICalculateTradesState> {
    public constructor(props: ICalculateTradesProp) {
        super(props);
        this.state = {
            years: getTradeYears(props.savedData.trades),
            downloadProps: {
                fileName: '',
                data: '',
                download: false,
            },
            currentYear: 0,
            showCustomizeModal: false,
            yearCalculationMethod: {},
        };
    }

    public calculateGains = (yearCalculationMethod: IYearCalculationMethod) => () => {
        const result = recalculate(
            this.props.savedData.holdings,
            this.props.savedData.trades,
            this.props.savedData.settings.fiatCurrency,
            yearCalculationMethod,
        );
        const data = calculateGainPerTrade(result.holdings, result.trades, this.props.savedData.settings.fiatCurrency, result.gainCalculationMethod);
        this.setState({
            filteredTradesWithGains: data.trades,
            longTermGains: data.longTerm,
            shortTermGains: data.shortTerm,
            showCustomizeModal: false,
            yearCalculationMethod,
        });
    }

    public onChange = (key: string, extra?: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'year':
                this.setState({
                    currentYear: parseInt(e.currentTarget.value, 10),
                });
                break;
            case 'yearGainCalculationMethod':
                if (extra !== undefined) {
                    const currentYearCalculationMethod = this.state.yearCalculationMethod;
                    currentYearCalculationMethod[extra] = e.currentTarget.value as METHOD;
                    this.setState({
                        yearCalculationMethod: currentYearCalculationMethod,
                    });
                }
                break;
        }
    }

    public generateForm8949 = () => {
        const result = recalculate(
            this.props.savedData.holdings,
            this.props.savedData.trades,
            this.props.savedData.settings.fiatCurrency,
            this.state.yearCalculationMethod,
        );
        const data = generateForm8949(
            result.holdings,
            result.trades,
            this.props.savedData.settings.fiatCurrency,
            result.gainCalculationMethod,
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
                <div className='tc pt2'>
                    <Button label='Customize' onClick={this.customizeModal}/>
                </div>
                { this.state.filteredTradesWithGains !== undefined && this.state.filteredTradesWithGains.length > 0 &&
                    <div>
                        <div className='flex justify-center'>
                            <h3 className='pa2'>Short Term Gains: {this.state.shortTermGains}</h3>
                            <h3 className='pa2'>Long Term Gains: {this.state.longTermGains}</h3>
                        </div>
                        <hr className="pa1 ma1"/>
                        <GainsPerTradeTable
                            fiatCurrency={this.props.savedData.settings.fiatCurrency}
                            trades={this.state.filteredTradesWithGains}
                        />
                    </div>
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
                        onGenerate={this.calculateGains}
                        onForm8949Export={this.generateForm8949}
                        years={this.state.years}
                        yearCalculationMethod={this.state.yearCalculationMethod}
                    />
                }
            </div>
        );
    }
}

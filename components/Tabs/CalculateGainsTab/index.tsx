import * as React from 'react';
import generateForm8949 from '../../../src/output/Form8949';
import { calculateGainPerTrade, calculateGains } from '../../../src/processing/CalculateGains';
import { addFiatRateToTrades } from '../../../src/processing/getFiatRate';
import {
    IHoldings,
    IIncomeWithFiatRate,
    ISavedData,
    ITrade,
    ITradeWithFiatRate,
    ITradeWithGains,
    METHOD,
} from '../../../src/types';
import getYears from '../../../src/utils/getYears';
import Button from '../../Button';
import { FileDownload, IFileDownloadProps } from '../../FileDownload';
import { GainsPerTradeTable } from '../../GainsPerTradeTable';
import Popup from '../../Popup';
import TradeDetails from '../../TradeDetails';
import { Customize, IYearCalculationMethod } from './Customize.component';
export interface ICalculateTradesTabProp {
    savedData: ISavedData;
}

export interface ICalculateTradesTabState {
    filteredTradesWithGains?: ITradeWithGains[];
    holdings: IHoldings;
    longTermGains?: number;
    shortTermGains?: number;
    years: string[];
    yearCalculationMethod: IYearCalculationMethod;
    downloadProps: IFileDownloadProps;
    currentYear: number;
    showCustomizeModal: boolean;
    whatIfTrade?: ITradeWithGains;
    whatIfTradeVisible: boolean;
}

function recalculate(
    trades: ITradeWithFiatRate[],
    incomes: IIncomeWithFiatRate[],
    fiatCurrnecy: string,
    yearCalculationMethod: IYearCalculationMethod,
) {
    const years = Object.keys(yearCalculationMethod);
    let newHoldings = {};
    if (years.length !== 1) {
        for (let index = 0; index < years.length - 1; index++) {
            const pastTrades = trades.filter(
                (trade) => new Date(trade.date).getFullYear() === parseInt(years[index], 10),
            );
            const pastIncomes = incomes.filter(
                (income) => new Date(income.date).getFullYear() === parseInt(years[index], 10),
            );
            const result = calculateGains(newHoldings, pastTrades, pastIncomes, fiatCurrnecy, yearCalculationMethod[years[index]]);
            newHoldings = result.newHoldings;
        }
    }

    const lastYear = years[years.length - 1];
    let newTrades = trades;
    let newIncomes = incomes;
    if (lastYear !== '----' && lastYear !== '0') {
        newTrades = trades.filter(
            (trade) => new Date(trade.date).getFullYear().toString() === lastYear,
        );
        newIncomes = incomes.filter(
            (income) => new Date(income.date).getFullYear().toString() === lastYear,
        );
    }
    return {
        incomes: newIncomes,
        holdings: newHoldings,
        trades: newTrades,
        gainCalculationMethod: yearCalculationMethod[lastYear],
    };
}

export class CalculateGainsTab extends React.Component<ICalculateTradesTabProp, ICalculateTradesTabState> {
    public constructor(props: ICalculateTradesTabProp) {
        super(props);
        this.state = {
            years: getYears(props.savedData.trades),
            downloadProps: {
                fileName: '',
                data: '',
                download: false,
            },
            currentYear: 0,
            showCustomizeModal: false,
            whatIfTradeVisible: false,
            yearCalculationMethod: {},
            holdings: props.savedData.holdings,
        };
    }

    public calculateGains = (yearCalculationMethod: IYearCalculationMethod) => () => {
        const result = recalculate(
            this.props.savedData.trades,
            this.props.savedData.incomes,
            this.props.savedData.settings.fiatCurrency,
            yearCalculationMethod,
        );
        const data = calculateGainPerTrade(
            result.holdings,
            result.trades,
            result.incomes,
            this.props.savedData.settings.fiatCurrency,
            result.gainCalculationMethod,
        );
        this.setState({
            filteredTradesWithGains: data.trades,
            longTermGains: data.longTerm,
            shortTermGains: data.shortTerm,
            holdings: data.holdings,
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
            this.props.savedData.trades,
            this.props.savedData.incomes,
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

    public whatIfTrade = () => {
        this.setState({whatIfTradeVisible: !this.state.whatIfTradeVisible});
    }

    public calculateWhatIfTrade = async (trade: ITrade) => {
        const tradeWithFiatRate = await addFiatRateToTrades(
            [trade],
            this.props.savedData.settings.fiatCurrency,
            this.props.savedData.settings.fiatRateMethod,
        );
        const data = calculateGainPerTrade(
            this.state.holdings,
            tradeWithFiatRate,
            [],
            this.props.savedData.settings.fiatCurrency,
            this.state.yearCalculationMethod[this.state.years[this.state.years.length - 1]],
        );
        this.setState({
            whatIfTrade: data.trades[0],
        });
    }

    public render() {
        return (
            <div className='calculategains'>
                <div className='tc pt2'>
                    <Button label='Customize' onClick={this.customizeModal}/>
                    <Button label='What If Trade' onClick={this.whatIfTrade}/>
                </div>
                { this.state.whatIfTradeVisible &&
                    <Popup onClose={this.whatIfTrade}>
                        <div>
                            <TradeDetails
                                onSubmit={this.calculateWhatIfTrade}
                                settings={this.props.savedData.settings}
                            />
                            { this.state.whatIfTrade &&
                                <div className='tc'>
                                    <h3>Short Term: {this.state.whatIfTrade.shortTerm}</h3>
                                    <h3>Long Term: {this.state.whatIfTrade.longTerm}</h3>
                                </div>
                            }
                        </div>
                    </Popup>
                }
                { this.state.filteredTradesWithGains !== undefined && this.state.filteredTradesWithGains.length > 0 &&
                    <div>
                        <div className='flex justify-center'>
                            <h3 className='pa2'>Short Term Gains: {this.state.shortTermGains}</h3>
                            <h3 className='pa2'>Long Term Gains: {this.state.longTermGains}</h3>
                        </div>
                        <hr className='pa1 ma1'/>
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

import * as React from 'react';
import { calculateInDepthHoldingsValueCurrently } from '../../../src/processing/CalculateHoldingsValue';
import { IHoldingsValueComplex, ISavedData, IPartialSavedData } from '../../../src/types';
import { Chart } from '../../Chart';
import { Loader } from '../../Loader';
import { PortfolioTable } from '../../PortfolioTable';
import Button from '../../Button';
import { calculateGains } from '../../../src/processing/CalculateGains';

export interface IPortfolioTabProp {
    savedData: ISavedData;
    save: (data: IPartialSavedData) => Promise<boolean>
}

export interface IPortfolioTabState {
    holdingsValue?: IHoldingsValueComplex;
    series: number[];
    currencies: string[];
}

export class PortfolioTab extends React.Component<IPortfolioTabProp, IPortfolioTabState> {

    public async componentDidMount() {
        const holdingsValue = await calculateInDepthHoldingsValueCurrently(
            this.props.savedData.holdings,
            this.props.savedData.settings.fiatCurrency,
        );
        const series = [];
        const currencies = Object.keys(holdingsValue.currencies);
        for (const currency of currencies) {
            series.push(holdingsValue.currencies[currency].fiatValue);
        }

        this.setState({
            holdingsValue,
            series,
            currencies,
        });
    }

    public recalculateHoldings = () => {
        const holdings = calculateGains(
            {},
            this.props.savedData.trades,
            this.props.savedData.settings.fiatCurrency,
            this.props.savedData.settings.gainCalculationMethod,
        ).newHoldings;
        this.props.save({
            holdings,
        });
    }

    public render() {
        return (
            <div className='portfolio'>
                <h3 className='tc'>Portfolio</h3>
                <hr className='center w-50' />
                <div className='tc center'>
                    <Button label="Recalculate Holdings" onClick={this.recalculateHoldings}/>
                    {this.state && this.state.holdingsValue !== undefined ?
                        <div>
                            <h4>Total BTC Value: {this.state.holdingsValue.BTCTotal}</h4>
                            <h4>
                                Total {this.props.savedData.settings.fiatCurrency}
                                Value: {this.state.holdingsValue.fiatTotal}
                            </h4>
                            <Chart
                                data={{
                                    chart: {
                                        type: 'pie',
                                    },
                                    series: this.state.series,
                                    labels: this.state.currencies,
                                    legend: {
                                        show: false,
                                    },
                                    annotations: {
                                        position: 'front',
                                    },
                                }}
                                className='w-50 center mw9'
                            />
                            <PortfolioTable
                                holdingsValue={this.state.holdingsValue}
                                fiatCurrency={this.props.savedData.settings.fiatCurrency}
                            />
                        </div>
                    :
                        <Loader />
                    }
                </div>
            </div>
        );
    }
}

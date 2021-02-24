import { useContext, useEffect, useState } from 'react';
import { calculateGains } from '../src/processing/CalculateGains';
import { calculateInDepthHoldingsValueCurrently } from '../src/processing/CalculateHoldingsValue';
import { IHoldingsValueComplex, IPartialSavedData, ISavedData } from '@types';
import Button from '@components/Button';
import { PortfolioTable } from '@components/PortfolioTable';
import SavedDataConext from '@contexts/savedData';
import dynamic from "next/dynamic";
import { Spinner } from '@blueprintjs/core';
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface IPortfolioState {
    holdingsValue?: IHoldingsValueComplex;
    series: number[];
    currencies: string[];
}


const Portfolio = () => {
    const {savedData, save} = useContext(SavedDataConext);
    const [holdingsValue, setHoldingsValue] = useState<IHoldingsValueComplex>();
    const [series, setSeries] = useState<number[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);

    useEffect(() => {
        calculatePortfolioData(savedData, setHoldingsValue, setSeries, setCurrencies)
    }, [savedData]);

    return (
        <div className='portfolio'>
            <h3 className='tc'>Portfolio</h3>
            <hr className='center w-50' />
            <div className='tc center'>
                <Button label='Recalculate Holdings' onClick={() => recalculateHoldings(savedData, save)}/>
                {holdingsValue !== undefined ?
                    <div>
                        <h4>Total BTC Value: {holdingsValue.BTCTotal}</h4>
                        <h4>
                            Total {savedData.settings.fiatCurrency}
                            Value: {holdingsValue.fiatTotal}
                        </h4>
                        <div className="flex justify-center">
                            {!!series.length && !!currencies.length &&
                                <ReactApexChart
                                    series={series}
                                    options={{
                                        labels: currencies,
                                        legend: {
                                            show: false,
                                        },
                                        annotations: {
                                            position: 'front',
                                        },
                                    }}
                                    width="600"
                                    type="donut"
                                />
                            }
                        </div>
                        <PortfolioTable
                            holdingsValue={holdingsValue}
                            fiatCurrency={savedData.settings.fiatCurrency}
                        />
                    </div>
                :
                    savedData?.trades.length > 0 ?
                        <Spinner />
                    :
                        <h3>No Trades Yet <i className='fa fa-frown-o'/></h3>
                }
            </div>
        </div>
    );
};

const calculatePortfolioData = async (
    savedData: ISavedData,
    setHoldingsValue: (holdingsValue: IHoldingsValueComplex) => void,
    setSeries: (holdingsValue: number[]) => void,
    setCurrencies: (holdingsValue: string[]) => void,
) => {
    if (savedData.trades.length > 0) {
        const holdingsValue = await calculateInDepthHoldingsValueCurrently(
            savedData.holdings,
            savedData.settings.fiatCurrency,
        );
        const series = [];
        const currencies = Object.keys(holdingsValue.currencies);
        for (const currency of currencies) {
            series.push(holdingsValue.currencies[currency].fiatValue);
        }

        setHoldingsValue(holdingsValue);
        setSeries(series);
        setCurrencies(currencies);
    }
}

const recalculateHoldings = (savedData: ISavedData, save: (data: IPartialSavedData) => Promise<boolean>) => {
    const holdings = calculateGains(
        {},
        savedData.trades,
        savedData.incomes,
        savedData.settings.fiatCurrency,
        savedData.settings.gainCalculationMethod,
    ).newHoldings;
    
    save({
        holdings,
    });
}

export default Portfolio;
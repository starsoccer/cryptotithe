import { useContext, useEffect, useState } from 'react';
import { calculateGains } from '../src/processing/CalculateGains';
import { calculateInDepthHoldingsValueCurrently } from '../src/processing/CalculateHoldingsValue';
import { IHoldingsValue, IHoldingsValueComplex, IPartialSavedData, ISavedData } from '../src/types';
import Button from '../components/Button';
import { Chart } from '../components/Chart';
import { Loader } from '../components/Loader';
import { PortfolioTable } from '../components/PortfolioTable';
import SavedDataConext from '@contexts/savedData';

export interface IPortfolioState {
    holdingsValue?: IHoldingsValueComplex;
    series: number[];
    currencies: string[];
}


const Portfolio = ({}) => {
    const {savedData, save} = useContext(SavedDataConext);
    const [holdingsValue, setHoldingsValue] = useState<IHoldingsValueComplex>(undefined);
    const [series, setSeries] = useState<number[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);


    useEffect(() => {
        calculatePortfolioData(savedData, setHoldingsValue, setSeries, setCurrencies)
    }, []);

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
                        {!!series.length && !!currencies.length &&
                            <Chart
                                data={{
                                    chart: {
                                        type: 'pie',
                                    },
                                    series: series,
                                    labels: currencies,
                                    legend: {
                                        show: false,
                                    },
                                    annotations: {
                                        position: 'front',
                                    },
                                }}
                                className='w-50 center mw9'
                            />
                        }
                        <PortfolioTable
                            holdingsValue={holdingsValue}
                            fiatCurrency={savedData.settings.fiatCurrency}
                        />
                    </div>
                :
                    savedData?.trades.length > 0 ?
                        <Loader />
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
import { useContext, useState } from 'react';
import SavedDataContext from '@contexts/savedData';
import DownloadContext from '@contexts/download';
import generateForm8949 from '../src/output/Form8949';
import { calculateGainPerTrade, calculateGains } from '../src/processing/CalculateGains';
import { addFiatRateToTrades } from '../src/processing/getFiatRate';
import getYears from '../src/utils/getYears';
import { IFileDownloadProps } from '@components/FileDownload';
import { GainsPerTradeTable } from '@components/GainsPerTradeTable';
import TradeDetails from '@components/TradeDetails';
import { Customize, IYearCalculationMethod } from '@components/Tabs/CalculateGainsTab/Customize.component';
import { IHoldings, ISavedData, ITrade, ITradeWithGains, ITradeWithFiatRate, IIncomeWithFiatRate, METHOD } from '@types';
import { Button, Dialog, Divider, Intent } from '@blueprintjs/core';

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

const Gains = () => {
    const {savedData} = useContext(SavedDataContext);
    const {setDownloadInfo} = useContext(DownloadContext);
    const [filteredTradesWithGains, setFilteredTradesWithGains] = useState<ITradeWithGains[]>([]);
    const [holdings, setHoldings] = useState<IHoldings>(savedData.holdings);
    const [longTermGains, setLongTermGain] = useState<number>(0);
    const [shortTermGains, setShortTermGain] = useState<number>(0);
    const [years] = useState<string[]>(getYears(savedData.trades));
    const [yearCalculationMethod, setYearCalculationMethod] = useState<IYearCalculationMethod>({});
    const [whatIfTrade, setWhatIfTrade] = useState<ITradeWithGains | undefined>(undefined);
    const [showWhatIfTrade, setShowWhatIfTrade] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [, setCurrentYear] = useState(0);

    const onChange = (key: string, extra?: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'year':
                setCurrentYear(parseInt(e.currentTarget.value, 10));
                break;
            case 'yearGainCalculationMethod':
                if (extra !== undefined) {
                    const currentYearCalculationMethod = yearCalculationMethod;
                    currentYearCalculationMethod[extra] = e.currentTarget.value as METHOD;
                    setYearCalculationMethod(currentYearCalculationMethod);
                }
                break;
        }
    }

    return (
        <div className='calculategains'>
            <div className='pt2 w5 center flex justify-around'>
                <Button
                    onClick={() => setShowCustomizeModal(!showCustomizeModal)}
                    intent={Intent.PRIMARY}
                    icon="cog"
                >
                    Customize
                </Button>
                <Button
                    intent={Intent.PRIMARY}
                    icon="predictive-analysis"
                    onClick={() => setShowWhatIfTrade(!showWhatIfTrade)}
                >
                    What If Trade
                </Button>
            </div>

            <Dialog
                isOpen={showWhatIfTrade}
                onClose={() => setShowWhatIfTrade(false)}
                title="Trade Simulator"
                icon="manually-entered-data"
            >
                <div>
                    <TradeDetails
                        onSubmit={(trade) => calculateWhatIfTrade(trade, savedData, holdings, yearCalculationMethod, years, setWhatIfTrade)}
                        settings={savedData.settings}
                    />
                    <Divider />
                    { whatIfTrade &&
                        <div className='tc'>
                            <h3>Short Term: {whatIfTrade.shortTerm}</h3>
                            <h3>Long Term: {whatIfTrade.longTerm}</h3>
                        </div>
                    }
                </div>
            </Dialog>
            
            { filteredTradesWithGains !== undefined && filteredTradesWithGains.length > 0 &&
                <div>
                    <div className='flex justify-center'>
                        <h3 className='pa2'>Short Term Gains: {shortTermGains}</h3>
                        <h3 className='pa2'>Long Term Gains: {longTermGains}</h3>
                    </div>
                    <hr className='pa1 ma1'/>
                    <GainsPerTradeTable
                        fiatCurrency={savedData.settings.fiatCurrency}
                        trades={filteredTradesWithGains}
                    />
                </div>
            }
            {showCustomizeModal &&
                <Customize
                    onClose={() => setShowCustomizeModal(false)}
                    onChange={onChange}
                    onGenerate={(newYearCalculation: IYearCalculationMethod) => {
                        calculateGainsForTable(
                            savedData,
                            newYearCalculation,
                            setFilteredTradesWithGains,
                            setShortTermGain,
                            setLongTermGain,
                            setHoldings,
                            setShowCustomizeModal,
                            setYearCalculationMethod,
                        )
                    }}
                    onForm8949Export={() => downloadOutput(savedData, yearCalculationMethod, setDownloadInfo)}
                    years={years}
                    yearCalculationMethod={yearCalculationMethod}
                />
            }
        </div>
    );
}

const downloadOutput = (savedData: ISavedData, yearCalculationMethod: IYearCalculationMethod, setDownloadInfo: (downloadInfo: IFileDownloadProps) => void) => {
    const result = recalculate(
        savedData.trades,
        savedData.incomes,
        savedData.settings.fiatCurrency,
        yearCalculationMethod,
    );
    const data = generateForm8949(
        result.holdings,
        result.trades,
        savedData.settings.fiatCurrency,
        result.gainCalculationMethod,
    );

    setDownloadInfo({
        data,
        fileName: 'Form8949.csv',
        download: true,
    });
}

const calculateWhatIfTrade = async (
    trade: ITrade,
    savedData: ISavedData,
    holdings: IHoldings,
    yearCalculationMethod: IYearCalculationMethod,
    years: string[],
    setWhatIfTrade: (trade: ITradeWithGains) => void,
) => {
    const tradeWithFiatRate = await addFiatRateToTrades(
        [trade],
        savedData.settings.fiatCurrency,
        savedData.settings.fiatRateMethod,
    );

    const data = calculateGainPerTrade(
        holdings,
        tradeWithFiatRate,
        [],
        savedData.settings.fiatCurrency,
        yearCalculationMethod[years[years.length - 1]],
    );

    setWhatIfTrade(data.trades[0]);
}

const calculateGainsForTable = async (
    savedData: ISavedData,
    yearCalculationMethod: IYearCalculationMethod,
    setFilteredTradesWithGains: (trades: ITradeWithGains[]) => void,
    setShortTermGain: (gain: number) => void,
    setLongTermGain: (gain: number) => void,
    setHoldings: (holdings: IHoldings) => void,
    setShowCustomizeModal: (showCustomizeModal: boolean) => void,
    setYearCalculationMethod: (yearCalculationMethod: IYearCalculationMethod) => void,
) => {
    const result = recalculate(
        savedData.trades,
        savedData.incomes,
        savedData.settings.fiatCurrency,
        yearCalculationMethod,
    );

    const data = calculateGainPerTrade(
        result.holdings,
        result.trades,
        result.incomes,
        savedData.settings.fiatCurrency,
        result.gainCalculationMethod,
    );
    
    await setFilteredTradesWithGains(data.trades);
    await setLongTermGain(data.longTerm);
    await setShortTermGain(data.shortTerm);
    await setHoldings(data.holdings);
    await setShowCustomizeModal(false);
    await setYearCalculationMethod(yearCalculationMethod);
}

export default Gains;
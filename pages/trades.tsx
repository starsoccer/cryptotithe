import {useContext, useState} from 'react';
import SavedDataContext from '@contexts/savedData';
import { addFiatRateToTrades } from '../src/processing/getFiatRate';
import sortTrades from '../src/processing/SortTrades';
import { ITradeWithFiatRate } from '@types';
import { ALL_CURRENCIES, ALL_EXCHANGES, filterTrades, TradeFilter } from '@components/TradeFilter';
import { TradesTable } from '@components/TradesTable';
import TradeTimeline from '@components/TradeTimeline';
import { ITrade } from '../src/types';
import { Spinner, Button, Intent, ControlGroup } from '@blueprintjs/core';

const defaultOptions = {
    exchange: ALL_EXCHANGES,
    currency: ALL_CURRENCIES,
};

const Trades = () => {
    const {savedData, save} = useContext(SavedDataContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTradeTable, setShowTradeTable] = useState(false);
    const [options, setOptions] = useState({...defaultOptions});

    const refetchFiatRate = async () => {
        setIsProcessing(true);
        const newTrades: ITradeWithFiatRate[] = await addFiatRateToTrades(
            savedData.trades,
            savedData.settings.fiatCurrency,
            savedData.settings.fiatRateMethod,
        );
        const sortedTrades: ITradeWithFiatRate[] = sortTrades(newTrades) as ITradeWithFiatRate[];
        save({trades: sortedTrades});
        setIsProcessing(false);
    };

    const savePassThrough = (trades: ITrade[] | ITradeWithFiatRate[]) => save({trades: trades as ITradeWithFiatRate[]});

    const filteredTrades = filterTrades(
        savedData.trades, options.exchange, options.currency,
    );

    return (
        <div className='viewTrades'>
            <h3 className='tc'>Trades</h3>
            <hr className='center w-50' />
            <div className='tc center pb2'>
                <Button
                    icon="refresh"
                    intent={Intent.WARNING}
                    onClick={refetchFiatRate}
                >
                    Refresh Trade Data
                </Button>
         
                <ControlGroup className="pt2 flex justify-center">
                    <Button icon="flow-linear" disabled={!showTradeTable} onClick={() => setShowTradeTable(!showTradeTable)}>
                        Timeline
                    </Button>
                    <Button icon="th" disabled={showTradeTable} onClick={() => setShowTradeTable(!showTradeTable)}>
                        Table
                    </Button>
                </ControlGroup>
            </div>
            <hr className='w-50'/>
            <div className='tc center'>
                <TradeFilter
                    trades={savedData.trades}
                    options={options}
                    onChange={setOptions}
                />
                <br />
                <Button
                    onClick={() => setOptions({...defaultOptions})}
                    icon="reset"
                    intent={Intent.DANGER}
                >
                    Reset Filter
                </Button>
            </div>
            <hr className='w-50'/>
            <div className='tc center'>
                {isProcessing ?
                    <Spinner />
                :
                    showTradeTable ?
                        filteredTrades.length > 0 ?
                            <TradesTable
                                trades={filteredTrades}
                                save={savePassThrough}
                                settings={savedData.settings}
                            />
                        :
                            <h3 className='tc'>No Trades <i className='fa fa-frown-o'></i></h3>
                    :
                        <TradeTimeline
                            trades={filteredTrades}
                            fiatCurrency={savedData.settings.fiatCurrency}
                            gainCalculationMethod={savedData.settings.gainCalculationMethod}
                            savedData={savedData}
                        /> // make this a clone or something
                }
            </div>
        </div>
    );

}

export default Trades;

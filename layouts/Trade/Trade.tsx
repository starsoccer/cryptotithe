import {useContext, useState} from 'react';
import SavedDataContext from '@contexts/savedData';
import { ITradeWithFiatRate } from '@types';
import { TradesTable } from '@components/TradesTable';
import TradeTimeline from '@components/TradeTimeline';
import { ITrade } from '../src/types';
import { Spinner, Button, ControlGroup, Divider } from '@blueprintjs/core';
import { TradeFilter } from './TradeFilter';

const Trades = () => {
    const {savedData, save} = useContext(SavedDataContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showTradeTable, setShowTradeTable] = useState(false);
    const [autoExpand, setAutoExpand] = useState(false);
    const [filteredTrades, setFilteredTrades] = useState<ITrade[]>(savedData.trades);

    const savePassThrough = (trades: ITrade[] | ITradeWithFiatRate[]) => save({trades: trades as ITradeWithFiatRate[]});

    return (
        <div className='viewTrades'>
            <div className='pt2'>
                <ControlGroup className="pt2 flex justify-center">
                    <Button icon="flow-linear" disabled={!showTradeTable} onClick={() => setShowTradeTable(!showTradeTable)}>
                        Timeline
                    </Button>
                    <Button icon="th" disabled={showTradeTable} onClick={() => setShowTradeTable(!showTradeTable)}>
                        Table
                    </Button>
                </ControlGroup>
                <Divider />
                    <TradeFilter
                        trades={savedData.trades}
                        applyFilter={setFilteredTrades}
                        autoExpand={autoExpand}
                        onAutoExpandChange={setAutoExpand}
                        showAutoExpand={!showTradeTable}
                    />
            </div>
            <Divider />
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
                            defaultExpanded={autoExpand}
                        />
                }
            </div>
        </div>
    );

}

export default Trades;

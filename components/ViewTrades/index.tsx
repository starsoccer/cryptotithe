import * as React from 'react';
import { addFiatRateToTrades } from '../../src/processing/getFiatRate';
import sortTrades from '../../src/processing/SortTrades';
import { FiatRateMethod, IPartialSavedData, ISavedData, ITrade, ITradeWithUSDRate } from '../../src/types';
import Button from '../Button';
import { Loader } from '../Loader';
import { TradesTable } from '../TradesTable';

export interface IViewTradesProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

export class ViewTrades extends React.Component<IViewTradesProp, {processing: boolean}> {

    public constructor(props: IViewTradesProp) {
        super(props);
        this.state = {
            processing: false,
        };
    }

    public save = (trades: ITrade[] | ITradeWithUSDRate[]) =>
        this.props.save({trades: trades as ITradeWithUSDRate[]})

    public refetchUSDRate = async () => {
        this.setState({processing: true});
        const newTrades: ITradeWithUSDRate[] = await addFiatRateToTrades(
            this.props.savedData.trades,
            'USD',
            FiatRateMethod[this.props.savedData.settings.fiatRateMethod],
        );
        const sortedTrades: ITradeWithUSDRate[] = sortTrades(newTrades) as ITradeWithUSDRate[];
        this.props.save({trades: sortedTrades});
        this.setState({processing: false});
    }

    public render() {
        return (
            <div className='viewTrades'>
                <h3 className='tc'>Trades</h3>
                <hr className='center w-50' />
                <div className='tc center'>
                <Button label='Refresh Trade Data' onClick={this.refetchUSDRate}/>
                {this.state.processing ?
                    <Loader />
                :
                    this.props.savedData.trades.length > 0 ?
                        <TradesTable
                            trades={this.props.savedData.trades}
                            save={this.save}
                        />
                    :
                        <h3 className='tc'>No Trades <i className='fa fa-frown-o'></i></h3>
                }
                </div>
            </div>
        );
    }
}

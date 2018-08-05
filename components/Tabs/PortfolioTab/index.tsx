import * as React from 'react';
import { calculateHoldingsValue } from '../../../src/processing/CalculateHoldingsValue';
import { ISavedData, IHoldingsValue } from '../../../src/types';
import { Loader } from '../../Loader';
import { PortfolioTable } from '../../PortfolioTable';

export interface IPortfolioTabProp {
    savedData: ISavedData;
}

export interface IPortfolioTabState {
    holdingsValue?: IHoldingsValue;
}

export class PortfolioTab extends React.Component<IPortfolioTabProp, IPortfolioTabState> {

    public constructor(props: IPortfolioTabProp) {
        super(props);
    }

    public async componentDidMount() {
        this.setState({
            holdingsValue: await calculateHoldingsValue(
                this.props.savedData.holdings,
                this.props.savedData.settings.fiatCurrency
            ),
        });
    }

    public render() {
        return (
            <div className='portfolio'>
                <h3 className='tc'>Portfolio</h3>
                <hr className='center w-50' />
                <div className='tc center'>
                    {this.state && this.state.holdingsValue !== undefined ?
                        <PortfolioTable
                            holdingsValue={this.state.holdingsValue}
                        />
                    :
                        <Loader />
                    }
                </div>
            </div>
        );
    }
}

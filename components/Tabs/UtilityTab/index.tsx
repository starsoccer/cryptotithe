import * as React from 'react';
import { ISavedData } from '../../../src/types';
import DailyBalance from './Utilities/DailyBalance';
export interface IUtilityTabProp {
    savedData: ISavedData;
}

export interface IUtilityTabState {
    utility: Utilities;
}

export enum Utilities {
    DailyBalance = 'Daily Balance',
}

export class UtilityTab extends React.Component<IUtilityTabProp, IUtilityTabState> {
    
    public constructor(props: IUtilityTabProp) {
        super(props);
        this.state = {
            utility: Utilities.DailyBalance,
        };
    }

    public showUtility = (utility: Utilities) => {
        switch (utility) {
            case Utilities.DailyBalance:
            default:
                return <DailyBalance savedData={this.props.savedData}/>;
        }
    }

    public render() {
        return (
            <div className='UtilityTab'>
                <div className="tc center">
                    <h3>Utilities</h3>
                    <label>Select Utility</label>
                    <select>
                        {Object.keys(Utilities).map((item) => <option key={item} value={item}>{Utilities[item]}</option>)}
                    </select>
                </div>
                <hr className="center w-50"/>
                {this.showUtility(this.state.utility)}
            </div>
        );
    }
}

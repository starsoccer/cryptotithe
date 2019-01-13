import * as React from 'react';
import { IPartialSavedData, ISavedData } from '../../../src/types';
import CurrencyRename from './Utilities/CurrencyRename';
import DailyBalance from './Utilities/DailyBalance';
import TransactionFee from './Utilities/TransactionFee';
export interface IUtilityTabProp {
    savedData: ISavedData;
    save(data: IPartialSavedData): Promise<boolean>;
}

export interface IUtilityTabState {
    utility: Utilities;
}

export enum Utilities {
    DailyBalance = 'Daily Balance',
    CurrencyRename = 'Currency Rename',
    TransactionFee = 'Transaction Fee',
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
            case Utilities.CurrencyRename:
                return <CurrencyRename savedData={this.props.savedData} save={this.props.save}/>;
            case Utilities.TransactionFee:
                return <TransactionFee savedData={this.props.savedData} save={this.props.save} />;
            case Utilities.DailyBalance:
            default:
                return <DailyBalance savedData={this.props.savedData}/>;
        }
    }

    public setUtility = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({utility: Utilities[e.currentTarget.value]});
    }

    public render() {
        return (
            <div className='UtilityTab'>
                <div className='tc center'>
                    <h3>Utilities</h3>
                    <label>Select Utility</label>
                    <select onChange={this.setUtility}>
                        {Object.keys(Utilities).map(
                            (item) => <option key={item} value={item}>{Utilities[item]}</option>,
                        )}
                    </select>
                </div>
                <hr className='center w-50'/>
                {this.showUtility(this.state.utility)}
            </div>
        );
    }
}

import * as React from 'react';
import { FiatRateMethod, IPartialSavedData, ISettings, METHOD } from '../../../src/types';
import Button from '../../Button';
import CalculationMethodSelect from '../../CalculationMethodSelect';
import Popup from '../../Popup';
export interface ISettingsProps {
    settings: ISettings;
    onSave: (savedData: IPartialSavedData) => Promise<boolean>;
    onClose: () => void;
}

function valueIfNotUndefined(object: any, key: string, fallback: string) {
    if (object !== undefined) {
        if (key in object) {
            return object[key];
        }
    }
    return fallback;
}

export class Settings extends React.Component<ISettingsProps, ISettings> {

    public constructor(props: ISettingsProps) {
        super(props);
        this.state = {
            fiatRateMethod: valueIfNotUndefined(props.settings, 'fiatRateMethod', Object.keys(FiatRateMethod)[0]),
            fiatCurrency: valueIfNotUndefined(props.settings, 'fiatCurrency', 'USD'),
            gainCalculationMethod: valueIfNotUndefined(props.settings, 'gainCalculationMethod', METHOD.FIFO),
        };
    }

    public onSettingsSave = async () => {
        const result = await this.props.onSave({settings: this.state});
        if (result) {
            this.props.onClose();
        } else {
            alert('Unable to save settings');
        }
    }

    public onRefresh = async () => {
        if (await this.props.onSave({})) {
            this.props.onClose();
        } else {
            alert('Unable to refresh data');
        }
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        switch (key) {
            case 'fiatRateMethod':
                this.setState({fiatRateMethod: e.currentTarget.value as FiatRateMethod});
                break;
            case 'fiatCurrency':
                this.setState({fiatCurrency: e.currentTarget.value.toUpperCase()});
                break;
            case 'gainCalculationMethod':
                this.setState({gainCalculationMethod: e.currentTarget.value as METHOD});
                break;
        }

    }

    public render() {
        return (
            <Popup onClose={this.props.onClose}>
                <div>
                    <h1 className='mt1 mb1'>Settings</h1>
                    <hr />
                    <div>
                        <label className='pr1'>Fiat Rate Calculation Method:</label>
                        <select
                            defaultValue={this.state.fiatRateMethod}
                            onChange={this.onChange('fiatRateMethod')}>
                            {Object.keys(FiatRateMethod).map((method) =>
                                <option key={method} value={FiatRateMethod[method]}>{method}</option>,
                            )}
                        </select>
                    </div>
                    <div>
                        <label className='pr1'>Fiat Rate Calculation Method:</label>
                        <input
                            type='text'
                            defaultValue={this.state.fiatCurrency}
                            onChange={this.onChange('fiatCurrency')}
                        />
                    </div>
                    <div>
                        <label className='pr1'>Fiat Gain Calculation Method:</label>
                        <CalculationMethodSelect
                            onChange={this.onChange('gainCalculationMethod')}
                            selectedMethod={this.state.gainCalculationMethod}
                        />
                    </div>
                    <hr />
                    <div className='flex justify-around'>
                        <Button label='Save' onClick={this.onSettingsSave}/>
                        <Button label='Rehash/Refresh Save Data' onClick={this.onRefresh}/>
                    </div>
                </div>
            </Popup>
        );
    }
}

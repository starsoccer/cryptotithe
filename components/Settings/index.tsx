import * as React from 'react';
import { FiatRateMethod, IPartialSavedData, ISettings, METHOD } from '../../src/types';
import Button from '../Button';
import Popup from '../Popup';
import CalculationMethodSelect from '../CalculationMethodSelect';
export interface ISettingsProps {
    settings: ISettings;
    onSettingsSave: (savedData: IPartialSavedData) => Promise<boolean>;
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
    public onSave = async () => {
        const result = await this.props.onSettingsSave({settings: this.state});
        if (result) {
            this.props.onClose();
        } else {
            alert('Unable to save settings');
        }
    }

    public onChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        switch (key) {
            case 'fiatRateMethod':
                this.setState({fiatRateMethod: e.currentTarget.value as keyof typeof FiatRateMethod});
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
                                <option key={method} value={method}>{FiatRateMethod[method]}</option>,
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
                    <Button label='Save' onClick={this.onSave}/>
                </div>
            </Popup>
        );
    }
}

import * as React from 'react';
import { FiatRateMethod, IPartialSavedData, ISettings } from '../../src/types';
import Button from '../Button';
import Popup from '../Popup';
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

    public onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({fiatRateMethod: e.currentTarget.value as keyof typeof FiatRateMethod});
    }

    public render() {
        return (
            <Popup onClose={this.props.onClose}>
                <div>
                    <h1 className='mt1 mb1'>Settings</h1>
                    <hr />
                    <label className='pr1'>Fiat Rate Calculation Method:</label>
                    <select
                        defaultValue={this.state.fiatRateMethod}
                        onChange={this.onChange}>
                        {Object.keys(FiatRateMethod).map((method) =>
                            <option key={method} value={method}>{FiatRateMethod[method]}</option>,
                        )}
                    </select>
                    <hr />
                    <Button label='Save' onClick={this.onSave}/>
                </div>
            </Popup>
        );
    }
}

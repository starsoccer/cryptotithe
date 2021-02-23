import { Button, Dialog, FormGroup, InputGroup, Intent, HTMLSelect, Divider } from '@blueprintjs/core';
import * as React from 'react';
import { FiatRateMethod, IPartialSavedData, ISettings, METHOD } from '../../../src/types';
import CalculationMethodSelect from '../../CalculationMethodSelect';
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
            <Dialog
                title="Settings"
                icon="cog"
                isOpen={true}
                onClose={this.props.onClose}
            >
                <div className="pt2 ph2">
                    <FormGroup
                        helperText="Chose which calculation method to use"
                        label="Fiat Rate Calculate Method"
                        labelFor="fiatRateMethod"
                        intent={Intent.PRIMARY}
                        inline={true}
                    >
                        <HTMLSelect 
                            defaultValue={this.state.fiatRateMethod}
                            onChange={this.onChange('fiatRateMethod')}
                        >
                            {Object.keys(FiatRateMethod).map((method) =>
                                <option key={method} value={FiatRateMethod[method]}>{method}</option>,
                            )}
                        </HTMLSelect>
                    </FormGroup>
                    <FormGroup
                        helperText="Chose which currency to consider base"
                        label="Fiat Currency"
                        labelFor="fiatCurrency"
                        intent={Intent.PRIMARY}
                        inline={true}
                    >
                        <InputGroup
                            type="text"
                            onChange={this.onChange('fiatCurrency')}
                            defaultValue={this.state.fiatCurrency}
                        />
                    </FormGroup>
                    <FormGroup
                        helperText="Chose which method to calculate fiat gains"
                        label="Fiat Gain Calculate Method"
                        labelFor="fiatCurrency"
                        intent={Intent.PRIMARY}
                        inline={true}
                    >
                        <CalculationMethodSelect
                            onChange={this.onChange('gainCalculationMethod')}
                            selectedMethod={this.state.gainCalculationMethod}
                        />
                    </FormGroup>
                    <Divider />
                    <div className='flex justify-around'>
                        <Button
                            onClick={this.onSettingsSave}
                            intent={Intent.PRIMARY}
                            icon="saved"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={this.onRefresh}
                            intent={Intent.WARNING}
                            icon="refresh"
                        >
                            Refresh Save Data
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    }
}

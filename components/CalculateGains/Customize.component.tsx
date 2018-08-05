import * as React from 'react';
import Button from '../Button';
import Popup from '../Popup';
import { METHOD } from '../../src/types';
export interface ICustomizeProps {
    onClose: () => void;
    onChange: (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onChangeCheckbox: () => void;
    onGenerate: () => void;
    onForm8949Export: () => void;
    years: string[];
    selectedYear: number;
    selectedMethod: METHOD;
    includePreviousYears: boolean;
}

export default class Customize extends React.Component<ICustomizeProps> {
    public constructor(props: ICustomizeProps) {
        super(props);
    }

    public render() {
        return (
            <Popup
                onClose={this.props.onClose}
            >
                <div>
                    <h1>Customize</h1>
                    <hr />
                    <div>
                        <div>
                            <label>Year</label>
                            <select
                                className='pl2'
                                onChange={this.props.onChange('year')}
                                defaultValue={this.props.selectedYear.toString()}
                            >
                                {this.props.years.map((year) => <option key={year} value={year}>
                                        {year}
                                    </option>,
                                )}
                            </select>
                        </div>
                        <div>
                            <label>Calculation Method</label>
                            <select
                                className='pl2'
                                onChange={this.props.onChange('gainCalculationMethod')}
                                defaultValue={this.props.selectedMethod}
                            >
                                {Object.keys(METHOD).map((method) =>
                                    <option
                                        key={method}
                                        value={METHOD[method]}
                                    >
                                    {method}
                                    </option>,
                                )}
                            </select>
                        </div>
                        <div>
                            <label>Include Previous Years</label>
                            <input
                                type='checkbox'
                                onChange={this.props.onChangeCheckbox}
                                checked={this.props.includePreviousYears}
                            />
                        </div>
                        <hr />
                        <div className="flex justify-around">
                            <Button label='Recalculate' onClick={this.props.onGenerate}/>
                            <Button label='Form 8949' onClick={this.props.onForm8949Export}/>
                        </div>
                    </div>
                </div>
            </Popup>
        );
    }
}

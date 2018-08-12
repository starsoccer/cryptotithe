import * as React from 'react';
import { METHOD } from '../../src/types';
export interface ICalculationMethodSelectProps {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    selectedMethod: METHOD;
}

export default class CalculationMethodSelect extends React.PureComponent<ICalculationMethodSelectProps> {
    public render() {
        return (
            <select
                className='pl2'
                onChange={this.props.onChange}
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
        );
    }
}

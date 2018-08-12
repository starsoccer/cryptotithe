import * as React from 'react';
export interface IToggleProps {
    className?: string;
    defaultValue?: boolean;
    onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export class Toggle extends React.PureComponent<IToggleProps> {
    public render() {
        return (
            <label className='toggle'>
                <link rel='stylesheet' type='text/css' href='./components/Toggle/index.css' />
                <input type='checkbox' onChange={this.props.onChange} defaultChecked={this.props.defaultValue}/>
                <span className='slider'></span>
            </label>
        );
    }
}

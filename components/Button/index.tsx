import * as React from 'react';
export interface IButtonProps {
    className?: string;
    label: string;
    onClick?(): void;
}

export default class Button extends React.PureComponent<IButtonProps> {
    public render() {
        return (
            <button className='bg-blue white bg-animate hover-bg-dark-blue' onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}

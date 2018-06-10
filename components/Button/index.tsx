// const React = require('react');
import * as React from 'react';
import { r } from '../../src/react';
export interface IButtonProps {
    className?: string;
    label: string;
    onClick?: () => void;
}

export class Button extends React.Component<IButtonProps> {
    public render() {
        return (
            <button className='bg-blue white bg-animate hover-bg-dark-blue' onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}

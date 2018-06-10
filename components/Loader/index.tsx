// const React = require('react');
import * as React from 'react';
export interface ILoaderProps {
    className?: string;
}

export class Loader extends React.Component<ILoaderProps> {
    public render() {
        return (
            <div className='center mt5 loader'>
                <link rel='stylesheet' type='text/css' href='./components/Loader/index.css' />
            </div>
        );
    }
}

import * as React from 'react';
export interface IPopupProps {
    className?: string;
    children: JSX.Element;
    onClose(): void;
}

export default class Popup extends React.PureComponent<IPopupProps> {
    public render() {
        return (
            <div className='popup'>
                <div className='fixed w-100 h-100 top-0 right-0 left-0 bottom-0 bg-black o-70 z-1' />
                <div className={`fixed dialog absolute w-70 ba b--black bw2 bg-white pa2 z-2 ${this.props.className}`}>
                    <i className='fr fa fa-times fa-2x' onClick={this.props.onClose}></i>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

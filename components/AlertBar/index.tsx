import * as classNames from 'classNames';
import * as React from 'react';

export enum AlertType {
    WARNING,
    ERROR,
    INFO,
    SUCCESS,
}

export interface IAlertBarProps {
    className?: string;
    message: string;
    onClick?(): void;
    type: AlertType;
}

export class AlertBar extends React.Component<IAlertBarProps> {
    public render() {
        return (
            <div className={
                classNames('alertbar lh-solid', {
                    'bg-red': this.props.type === AlertType.ERROR,
                    'bg-orange': this.props.type === AlertType.WARNING,
                    'bg-blue': this.props.type === AlertType.INFO,
                    'bg-green': this.props.type === AlertType.SUCCESS,
            })}>
                <h2 className='dib pl2 mb1 mt1 pb1 pt1 pre overflow-hidden'>
                    {this.props.message}
                </h2>
                <i className='fr pt1 pl2 pr2 fa fa-times-circle fa-2x grow' onClick={this.props.onClick}/>
            </div>
        );
    }
}

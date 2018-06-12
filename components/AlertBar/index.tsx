import * as React from 'react';
export interface IAlertBarProps {
    className?: string;
    message: string;
    onClick?: () => void;
}

export class AlertBar extends React.Component<IAlertBarProps> {
    public render() {
        return (
            <div className='alertbar bg-red lh-solid'>
                <h2 className='dib pl2 mb1 mt1 pb1 pt1'>
                    {this.props.message}
                </h2>
                <i className='fr pt1 pl2 pr2 fa fa-times-circle fa-2x grow' onClick={this.props.onClick}/>
            </div>
        );
    }
}

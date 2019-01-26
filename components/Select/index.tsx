import * as React from 'react';
export interface ISelectProps {
    className?: string;
    name?: string;
    id?: string;
    onChange: (value: string) => void;
    options: IOptions;
    inputFallback?: boolean;
}

export interface IOptions {
    [key: string]: string | number;
}

export class Select extends React.PureComponent<ISelectProps, {inputVisible: boolean}> {
    public constructor(props: ISelectProps) {
        super(props);
        this.state = {
            inputVisible: false,
        };
    }

    private onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'OTHER') {
            this.setState({inputVisible: true});
        } else {
            this.props.onChange(event.target.value);
        }
    }

    private onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === '') {
            this.setState({inputVisible: false});
        } else {
            this.props.onChange(event.target.value);
        }
    }

    public render() {
        if (this.props.inputFallback && this.state.inputVisible) {
            return (<input
                className={this.props.className} name={this.props.name} id={this.props.id} onChange={this.onInputChange}
            />);
        } else {
            return (
                <select
                    name={this.props.name}
                    id={this.props.id}
                    onChange={this.onSelectChange}
                    className={this.props.className}
                >
                    {Object.keys(this.props.options).map((option: string) =>
                        <option key={option} value={this.props.options[option]}>
                            {option}
                        </option>,
                    )}
                    <option key={'Other'} value={'OTHER'}>
                        Other
                    </option>
                </select>
            );
        }
    }
}

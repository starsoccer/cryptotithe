import * as React from 'react';
import { METHOD } from '../../../src/types';
import Button from '../../Button';
import CalculationMethodSelect from '../../CalculationMethodSelect';
import Popup from '../../Popup';
import { Table } from '../../Table';
export interface ICustomizeProps {
    onClose: () => void;
    onChange: (key: string, extra?: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onGenerate: (yearCalculationMethod: IYearCalculationMethod) => () => void;
    onForm8949Export: () => void;
    years: string[];
    yearCalculationMethod: IYearCalculationMethod;
}

export interface ICustomizeState {
    showPerYearCalcutionMethod: boolean;
    includePreviousYears: boolean;
    gainCalculationMethod: METHOD;
    yearCalculationMethod: IYearCalculationMethod;
    year: string;
    [key: string]: string | boolean | METHOD | IYearCalculationMethod;
}

export interface IYearCalculationMethod {
    [key: number]: METHOD;
}

function getLastYear(years: string[]) {
    return years[years.length - 1];
}

function createYearCalculationMethod(
    years: string[],
    selectedYear: string,
    includePreviousYears: boolean,
    gainCalculationMethod: METHOD,
) {
    const yearCalculationMethod = {};
    for (const year of years) {
        if (year === selectedYear || (includePreviousYears && year < selectedYear)) {
            yearCalculationMethod[year] = gainCalculationMethod;
        }
    }
    return yearCalculationMethod;
}

export class Customize extends React.Component<ICustomizeProps, ICustomizeState> {
    public constructor(props: ICustomizeProps) {
        super(props);
        const yearCalculationMethods = Object.keys(props.yearCalculationMethod);
        if (yearCalculationMethods.length) {
            const allGainMethodsIdentical = yearCalculationMethods.every((val) =>
                props.yearCalculationMethod[val] === props.yearCalculationMethod[yearCalculationMethods[0]],
            );
            let noGapYears = true;
            for (
                let index = parseInt(yearCalculationMethods[0], 10);
                index <= parseInt(yearCalculationMethods[yearCalculationMethods.length - 1], 10);
                index++
            ) {
                if (
                    yearCalculationMethods.indexOf(index.toString()) === -1 &&
                    props.years.indexOf(index.toString()) !== -1
                ) {
                    noGapYears = false;
                    break;
                }
            }

            const showPerYearCalcutionMethod = (allGainMethodsIdentical && !noGapYears) ||
                (!allGainMethodsIdentical && noGapYears);
            this.state = {
                showPerYearCalcutionMethod,
                includePreviousYears: !showPerYearCalcutionMethod,
                gainCalculationMethod: props.yearCalculationMethod[yearCalculationMethods[0]],
                year: (yearCalculationMethods.length === 1 ?
                    yearCalculationMethods[0] :
                    yearCalculationMethods[yearCalculationMethods.length - 1]
                ),
                yearCalculationMethod: props.yearCalculationMethod,
            };
        } else {
            this.state = {
                showPerYearCalcutionMethod: false,
                includePreviousYears: true,
                gainCalculationMethod: METHOD.FIFO,
                year: '0',
                yearCalculationMethod: {
                    0: METHOD.FIFO,
                },
            };
        }
    }

    public onSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (key) {
            case 'year':
                const year = e.currentTarget.value;
                this.setState({
                    yearCalculationMethod: createYearCalculationMethod(
                        this.props.years,
                        year,
                        this.state.includePreviousYears,
                        this.state.gainCalculationMethod,
                    ),
                    year,
                });
                break;
            case 'gainCalculationMethod':
                const gainCalculationMethod = e.currentTarget.value as METHOD;
                this.setState({
                    yearCalculationMethod: createYearCalculationMethod(
                        this.props.years,
                        this.state.year,
                        this.state.includePreviousYears,
                        gainCalculationMethod,
                    ),
                    gainCalculationMethod,
                });
                break;
        }
    }

    public onCheckBoxChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            [key]: e.currentTarget.checked,
            yearCalculationMethod: createYearCalculationMethod(
                this.props.years,
                this.state.year,
                (key === 'includePreviousYears' ? e.currentTarget.checked : this.state.includePreviousYears),
                this.state.gainCalculationMethod,
            ),
        });
    }

    public onYearGainChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const yearCalculationMethod = this.state.yearCalculationMethod;
        yearCalculationMethod[key] = e.currentTarget.value as METHOD;
        this.setState({
            yearCalculationMethod,
        });
    }

    public onAddOrRemoveYear = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const yearCalculationMethod = this.state.yearCalculationMethod;
        if (e.currentTarget.checked) {
            yearCalculationMethod[key] = e.currentTarget.value as METHOD;
        } else {
            delete yearCalculationMethod[key];
        }
        this.setState({
            yearCalculationMethod,
        });
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
                            <label>Customize Calcution Method Per Year</label>
                            <input
                                type='checkbox'
                                defaultChecked={this.state.showPerYearCalcutionMethod}
                                onChange={this.onCheckBoxChange('showPerYearCalcutionMethod')}
                            />
                        </div>
                        <div>
                            <label>Include Previous Years</label>
                            <input
                                type='checkbox'
                                defaultChecked={this.state.includePreviousYears}
                                onChange={this.onCheckBoxChange('includePreviousYears')}
                            />
                        </div>
                        {this.state.showPerYearCalcutionMethod ?
                            <div>
                                <label>Gain Method For Each Year</label>
                                <Table
                                    headers={['Year', 'Calculation Method', 'Include Year']}
                                    rows={this.props.years.map((year) => [
                                        <span>{year}</span>,
                                        <CalculationMethodSelect
                                            onChange={this.onYearGainChange(year)}
                                            selectedMethod={this.state.yearCalculationMethod[year]}
                                        />,
                                        <input
                                            type='checkbox'
                                            checked={year in this.state.yearCalculationMethod}
                                            onChange={this.onAddOrRemoveYear(year)}
                                        />,
                                    ])}
                                />
                            </div>
                        :
                            <div>
                                <div>
                                    <label>Year</label>
                                    <select
                                        className='pl2'
                                        onChange={this.onSelectChange('year')}
                                        defaultValue={getLastYear(Object.keys(this.props.yearCalculationMethod))}
                                    >
                                        <option key='----' value='0'>----</option>
                                        {this.props.years.map((year) => <option key={year} value={year}>
                                                {year}
                                            </option>,
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label>Calculation Method</label>
                                    <CalculationMethodSelect
                                        onChange={this.onSelectChange('gainCalculationMethod')}
                                        selectedMethod={this.props.yearCalculationMethod[
                                            getLastYear(Object.keys(this.props.yearCalculationMethod))
                                        ]}
                                    />
                                </div>
                            </div>
                        }
                        <hr />
                        <div className='flex justify-around'>
                            <Button
                                label='Recalculate'
                                onClick={this.props.onGenerate(this.state.yearCalculationMethod)}
                            />
                            <Button label='Form 8949' onClick={this.props.onForm8949Export}/>
                        </div>
                    </div>
                </div>
            </Popup>
        );
    }
}

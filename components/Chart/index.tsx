import * as React from 'react';

export interface IApexChartsSeries {
    data: number[] | number[][]
}

export interface IApexChartsData {
    chart: {
        type: string;
        width?: number;
    },
    series: IApexChartsSeries[] | number[];
    xaxis?: any;
    labels?: string[];
    legend?: {
        show: boolean;
    }
    annotations?: any;
}

export interface IChartProp {
    data: IApexChartsData;
    className?: string;
}

export class Chart extends React.Component<IChartProp> {

    public async componentDidMount() {
        const ApexCharts = require('apexcharts');
        const chart = new ApexCharts(document.querySelector("#charts"), this.props.data);
        chart.render();
    }

    public render() {
        return (
            <div id="charts" className={`charts ${this.props.className}`} />
        );
    }
}

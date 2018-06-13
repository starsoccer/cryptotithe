import * as React from 'react';

export interface ITableProps {
    className?: string;
    headers: string[];
    rows: JSX.Element[][];
}

export class Table extends React.Component<ITableProps> {
    public render() {
        return (
            <div className='tradesTable pa4'>
                <div className='overflow-auto'>
                    <table className='f6 w-100 mw8 center'>
                        <thead>
                            <tr className='stripe-dark'>
                                {this.props.headers.map((header) =>
                                    <th key={header} className='fw6 tl pa3 bg-white'>{header}</th>,
                                )}
                            </tr>
                        </thead>
                        <tbody className='lh-copy'>{
                            this.props.rows.map((row, index) =>
                                <tr className='stripe-dark' key={index}>
                                    {row.map((col, colindex) =>
                                        <td key={`${index}-${colindex}`} className='pa3'>{col}</td>)}
                                </tr>,
                        )}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

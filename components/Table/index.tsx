import * as crypto from 'crypto';
import * as React from 'react';

export interface ITableProps {
    className?: string;
    headers: string[];
    rows: JSX.Element[][];
}

export function createHash(htmlElement: JSX.Element) {
    if (typeof htmlElement !== 'object') {
        return crypto.createHash('sha256').update(htmlElement).digest('hex');
    } else {
        if (typeof htmlElement.props.children === 'object') {
            return crypto.createHash('sha256').update(
                htmlElement.props.children.map((data: JSX.Element) => createHash(data)).toString(),
            ).digest('hex');
        } else {
            return crypto.createHash('sha256').update(htmlElement.props.children + htmlElement.type).digest('hex');
        }
    }
}

export class Table extends React.PureComponent<ITableProps> {
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
                            this.props.rows.map((row, index) => {
                                const rowHashs: string[] = [];
                                const rowData = row.map((col, colIndex) => {
                                    const cellHash = createHash(col);
                                    rowHashs.push(cellHash);
                                    return <td key={cellHash + colIndex} className='pa2 mw4 break-word'>
                                        {col}
                                    </td>;
                                });
                                const hash = crypto.createHash('sha256').update(
                                    rowHashs.join('-') + index,
                                ).digest('hex');
                                return <tr className='stripe-dark' key={hash}>{rowData}</tr>;
                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

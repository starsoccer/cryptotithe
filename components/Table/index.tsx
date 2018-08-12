import * as React from 'react';

export interface ITableProps {
    className?: string;
    headers: string[];
    rows: JSX.Element[][];
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
                            this.props.rows.map((row) => { 
                                const keyHash = crypto.createHash('sha256').update(row.toString()).digest('hex'); 
                                return <tr className='stripe-dark' key={keyHash}>{ 
                                    row.map((col) => { 
                                        const cellHash = crypto.createHash('sha256').update(col.toString()).digest('hex'); 
                                        <td key={`${keyHash}-${cellHash}`} className='pa2 mw4 break-word'> 
                                            {col} 
                                        </td> 
                                    }) 
                                }</tr>; 
                            }) 
                        }</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

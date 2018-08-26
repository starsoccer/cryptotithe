import * as crypto from 'crypto';
import * as React from 'react';
import * as InfiniteScroll from 'react-infinite-scroller';
import { Loader } from '../Loader';

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

const itemsPerPage = 100;

export class Table extends React.Component<ITableProps, {page: number}> {
    public constructor(props: ITableProps) {
        super(props);
        this.state = {
            page: 0,
        };
    }

    public moreTrades = (page: number) => {
        this.setState({
            page,
        });
    }

    public render() {
        return (
            <div className='tradesTable pa4 overflow-hidden'>
                <InfiniteScroll
                    pageStart={this.state.page}
                    loadMore={this.moreTrades}
                    hasMore={this.state.page * itemsPerPage <= this.props.rows.length}
                    loader={<Loader key={this.state.page}/>}
                >
                    <table className='f6 w-100 mw8 center'>
                        <thead>
                            <tr className='stripe-dark'>
                                {this.props.headers.map((header) =>
                                    <th key={header} className='fw6 tl pa3 bg-white'>{header}</th>,
                                )}
                            </tr>
                        </thead>
                        <tbody className='lh-copy'>{
                            this.props.rows.slice(0, this.state.page * itemsPerPage).map((row, index) => {
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
                </InfiniteScroll>
            </div>
        );
    }
}

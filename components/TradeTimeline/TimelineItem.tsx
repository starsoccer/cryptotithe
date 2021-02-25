import { Card, Collapse, Divider, Elevation, Intent, Tag } from "@blueprintjs/core";
import classes from './TradeTimeline.module.scss';
import classnames from 'classnames';
import { useEffect, useState } from "react";
import { EXCHANGES, IHoldings, ITrade } from "@types";
import keyByValue from '../../src/utils/keyByValue';

export interface ITimelineItem {
    trade: ITrade;
    left: boolean;
    holdings: IHoldings;
    defaultExpanded: boolean;
}

const getCurrencyHolding = (holdings: IHoldings, currency: string) => {
    let totalHoldings = 0;
    if (currency in holdings) {
        for (const holding of holdings[currency]) {
            totalHoldings += holding.amount;
        }
    }
    return totalHoldings;
};

export const TimelineItem = ({trade, holdings, left, defaultExpanded}: ITimelineItem) => {
    const [isOpen, setIsOpen] = useState(defaultExpanded);

    useEffect(() => setIsOpen(defaultExpanded), [defaultExpanded])

    return (
        <div
            className={classnames({
                [classes.leftTimelineItem]: left,
                [classes.rightTimelineItem]: !left,
            })}
            key={trade.ID}
        >
            <Card elevation={Elevation.FOUR} interactive={true} onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-around pb2">
                    <Tag icon="minus" intent={Intent.DANGER} >{trade.amountSold.toFixed(8)} {trade.soldCurrency}</Tag>
                    <Tag icon="slash" intent={Intent.PRIMARY}>{trade.rate.toFixed(8)}</Tag>
                    <Tag icon="plus" intent={Intent.SUCCESS} >{(trade.amountSold / trade.rate).toFixed(8)} {trade.boughtCurrency}</Tag>
                </div>
                <Collapse isOpen={isOpen}>
                    <Divider />
                    <Tag icon="exchange">
                        {keyByValue(trade.exchange, EXCHANGES) || (trade.exchange && trade.exchange !== '' ? trade.exchange : 'Unknown')}
                    </Tag>
                    <h5 className="ma0 mt1">New Holdings</h5>
                    <div className="flex justify-around pa2">
                        <Tag icon="minus" intent={Intent.DANGER} >{getCurrencyHolding(holdings, trade.soldCurrency).toFixed(8)} {trade.soldCurrency}</Tag>
                        <Tag icon="plus" intent={Intent.SUCCESS} >{getCurrencyHolding(holdings, trade.boughtCurrency).toFixed(8)} {trade.boughtCurrency}</Tag>
                    </div>
                </Collapse>
                <h5 className="ma0">{new Date(trade.date).toUTCString()}</h5>
            </Card>
        </div>
    );
    
};
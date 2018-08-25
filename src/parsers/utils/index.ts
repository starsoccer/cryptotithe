import * as crypto from 'crypto';
import { IPartialTrade } from '../../types';

export function createDateAsUTC(date: Date) {
    return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    ));
}

export function createTradeID(trade: IPartialTrade) {
    return crypto.createHash('sha256').update(
        JSON.stringify(trade) + new Date().getTime() + Math.random(),
    ).digest('hex');
}

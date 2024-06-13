import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum LiquidOrderDirection {
    PAY = 'PAY',
    RECEIVE = 'RECEIVE',
}

interface ILiquid {
    exchange: string;
    currency_type: string;
    direction: string;
    transaction_id: string;
    transaction_type: string;
    gross_amount: string;
    currency: string;
    execution_id: string;
    generated_for_type: string;
    generated_for_id: string;
    transaction_hash: string;
    from_address: string;
    to_address: string;
    state: string;
    created_at_jst: string;
    updated_at_jst: string;
    created_at_utc: string;
    updated_at: string;
    notes: string;
    used_id: string;
    account_id: string;
}

interface ILiquidGroup {
    [key: string]: ILiquid[];
}

function groupByExecutionID(group: ILiquidGroup, line: ILiquid) {
    group[line.execution_id] = group[line.execution_id] ?? [];
    group[line.execution_id].push(line);
    return group;
}

function groupByCreatedAtUTC(group: ILiquidGroup, line: ILiquid) {
    group[line.created_at_utc] = group[line.created_at_utc] ?? [];
    group[line.created_at_utc].push(line);
    return group;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    let data2: ILiquid[] = [];
    if (importDetails.data2 !== undefined ) {
        data2 = await getCSVData(importDetails.data2) as ILiquid[];
    }
    const data: ILiquid[] = (await getCSVData(importDetails.data) as ILiquid[]).concat(data2);
    const internalFormat: ITrade[] = [];
    const sorted = data.sort(function(a, b){
        const dateA = createDateAsUTC(new Date(a.created_at_utc)).getTime();
        const dateB = createDateAsUTC(new Date(b.created_at_utc)).getTime();
        return dateA - dateB;
    });
    const grouped = sorted.reduce(groupByExecutionID, {});
    for (const execution in grouped) {
        const trades = grouped[execution];
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(trades[0].created_at_utc)).getTime(),
            exchange : EXCHANGES.Liquid,
            exchangeID : execution,
        };
        if (execution === '') {
            const dateGrouped = trades.reduce(groupByCreatedAtUTC, {});
            for (const date in dateGrouped) {
                const groupedTrades = dateGrouped[date];
                const firstLine = groupedTrades[0];
                switch (firstLine.transaction_type) {
                    /*case 'funding': {
                        // TODO: create a deposit transaction
                        break;
                    }
                    case 'withdrawal': {
                        // TODO: create a withdrawal transaction
                        break;
                    }*/
                    case 'quick_exchange': {
                        if (groupedTrades.length == 2) {
                            internalFormat.push(addTrade(tradeToAdd, groupedTrades[0], groupedTrades[1]));
                        } else {
                            console.error(`Error parsing ${tradeToAdd.exchange} quick exchange.
                                It extends over ${groupedTrades.length} lines`);
                        }
                        break;
                    }
                    default: {
                        console.log(`Ignored ${tradeToAdd.exchange} trade of type ${firstLine.transaction_type}`);
                    }
                }
            }
            continue;
        }
        switch (trades[0].transaction_type) {
            case 'trade': {
                switch (trades.length) {
                    case 1: {
                        internalFormat.push(addSingleLineTrade(tradeToAdd, trades[0]));
                        break;
                    }
                    case 2: {
                        internalFormat.push(addTrade(tradeToAdd, trades[0], trades[1]));
                        break;
                    }
                    case 3: {
                        internalFormat.push(addTrade(tradeToAdd, trades[0], trades[1], trades[2]));
                        break;
                    }
                    case 4: {
                        internalFormat.push(addTrade(tradeToAdd, trades[0], trades[1], trades[2], trades[3]));
                        break;
                    }
                    case 6: {
                        let secondTrade = tradeToAdd;
                        if (trades[0].direction !== trades[2].direction) {
                            internalFormat.push(addTrade(tradeToAdd, trades[0], trades[2], trades[4], trades[5]));
                            internalFormat.push(addTrade(secondTrade, trades[1], trades[3]));
                        } else {
                            internalFormat.push(addTrade(tradeToAdd, trades[0], trades[3], trades[4], trades[5]));
                            internalFormat.push(addTrade(secondTrade, trades[1], trades[2]));
                        }
                        break;
                    }
                    case 8: {
                        let secondTrade = tradeToAdd;
                        if (trades[0].direction !== trades[2].direction) {
                            internalFormat.push(addTrade(tradeToAdd, trades[0], trades[2], trades[4], trades[5]));
                            internalFormat.push(addTrade(secondTrade, trades[1], trades[3], trades[6], trades[7]));
                        } else {
                            internalFormat.push(addTrade(tradeToAdd, trades[0], trades[3], trades[4], trades[5]));
                            internalFormat.push(addTrade(secondTrade, trades[1], trades[2], trades[6], trades[7]));
                        }
                        break;
                    }
                    default: {
                        console.error(`Error parsing ${tradeToAdd.exchange} trade.
                            It extends over ${trades.length} lines`);
                        console.info(trades);
                    }
                }
                break;
            }
            case 'rebate_trade_fee':
            case 'trade_fee': {
                console.error(`Error parsing ${tradeToAdd.exchange} trade.
                    First line should not be of type ${trades[0].transaction_type}`);
                break;
            }
            default: {
                console.log(`Ignored ${tradeToAdd.exchange} trade of type ${trades[0].transaction_type}`);
            }
        }
    }
    return internalFormat;
}

function addSingleLineTrade(
    tradeToAdd: IPartialTrade,
    trade: ILiquid,
) : ITrade {
    if (trade.direction.toUpperCase() === LiquidOrderDirection.PAY) {
        tradeToAdd.boughtCurrency = trade.currency;
        tradeToAdd.soldCurrency = trade.currency;
        tradeToAdd.amountSold = 0;
        tradeToAdd.rate = 1;
        tradeToAdd.tradeFee = parseFloat(trade.gross_amount);
        tradeToAdd.tradeFeeCurrency = trade.currency;
    } else if (trade.direction.toUpperCase() === LiquidOrderDirection.RECEIVE) {
        // TODO: Replace by an income
        tradeToAdd.soldCurrency = 'USDT';
        tradeToAdd.boughtCurrency = trade.currency;
        tradeToAdd.amountSold = 0;
        tradeToAdd.rate = 0 / parseFloat(trade.gross_amount);
    }
    else {
        console.info(trade);
        throw new Error(`Error parsing ${tradeToAdd.exchange} trade.direction=${trade.direction}`);
    }
    tradeToAdd.ID = createID(tradeToAdd);
    return tradeToAdd as ITrade;
}

function addTrade(
    tradeToAdd: IPartialTrade,
    firstHalf: ILiquid,
    secondHalf: ILiquid,
    feeTrade?: ILiquid,
    rebateFeeTrade?: ILiquid,
): ITrade {
    let firstHalfDirection = firstHalf.direction.toUpperCase();
    let secondHalfDirection = secondHalf.direction.toUpperCase();
    if (firstHalfDirection === LiquidOrderDirection.PAY && secondHalfDirection === LiquidOrderDirection.RECEIVE) {
        tradeToAdd.boughtCurrency = secondHalf.currency;
        tradeToAdd.soldCurrency = firstHalf.currency;
        tradeToAdd.amountSold = Math.abs(parseFloat(firstHalf.gross_amount));
        tradeToAdd.rate = Math.abs(parseFloat(firstHalf.gross_amount) / parseFloat(secondHalf.gross_amount));
    } else if (firstHalfDirection === LiquidOrderDirection.RECEIVE && secondHalfDirection === LiquidOrderDirection.PAY) {
        tradeToAdd.soldCurrency = secondHalf.currency;
        tradeToAdd.boughtCurrency = firstHalf.currency;
        tradeToAdd.amountSold = Math.abs(parseFloat(secondHalf.gross_amount));
        tradeToAdd.rate = Math.abs(parseFloat(secondHalf.gross_amount) / parseFloat(firstHalf.gross_amount));
    } else {
        console.info(firstHalf);
        console.info(secondHalf);
        throw new Error(`Error parsing ${tradeToAdd.exchange} firstHalf.direction=${firstHalf.direction}
            and secondHalf.direction=${secondHalf.direction}`);
    }
    if (feeTrade !== undefined) {
        let amount = parseFloat(feeTrade.gross_amount);
        if (rebateFeeTrade !== undefined) {
            amount -= parseFloat(rebateFeeTrade.gross_amount);
        }
        tradeToAdd.tradeFee = amount;
        tradeToAdd.tradeFeeCurrency = feeTrade.currency;
    }
    tradeToAdd.ID = createID(tradeToAdd);
    return tradeToAdd as ITrade;
}

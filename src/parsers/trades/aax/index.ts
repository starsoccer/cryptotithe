import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

interface IAAX {
    Coin: string;
    Quantity: string;
    Type: string;
    Details: string;
    Time: string;
}

interface IAAXGroup {
    [key: string]: IAAX[];
}

function groupByType(group: IAAXGroup, line: IAAX) {
    group[line.Type] = group[line.Type] ?? [];
    group[line.Type].push(line);
    return group;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IAAX[] = (await getCSVData(importDetails.data) as IAAX[]);
    const internalFormat: ITrade[] = [];
    for (let i = 0; i < data.length; i++) {
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(data[i].Time)).getTime(),
            exchange : EXCHANGES.AAX,
        };
        switch (data[i].Type) {
            case 'Trading': {
                const trades = [data[i], data[++i], data[++i]];
                const groupedTrades = trades.reduce(groupByType, {});
                internalFormat.push(addTrade(tradeToAdd, groupedTrades['Trading'][0], groupedTrades['Trading'][1], groupedTrades['Trading Fee'][0]));
                break;
            }
            case 'Convert': {
                internalFormat.push(addTrade(tradeToAdd, data[i], data[++i]));
                break;
            }
            // TODO: Withdrawal, Deposit, System Deposit, Fixed Interest, Flexible Interest
            default: {
                console.log(`Ignored ${tradeToAdd.exchange} trade of type ${data[i].Type}`);
            }
        }
    }
    return internalFormat;
}

function addTrade(
    tradeToAdd: IPartialTrade,
    firstHalf: IAAX,
    secondHalf: IAAX,
    feeTrade?: IAAX,
): ITrade {
    let firstHalfDirection = parseFloat(firstHalf.Quantity) > 0;
    let secondHalfDirection = parseFloat(secondHalf.Quantity) > 0;
    if (firstHalfDirection && !secondHalfDirection) {
        tradeToAdd.boughtCurrency = firstHalf.Coin;
        tradeToAdd.soldCurrency = secondHalf.Coin;
        tradeToAdd.amountSold = Math.abs(parseFloat(secondHalf.Quantity));
        tradeToAdd.rate = Math.abs(parseFloat(secondHalf.Quantity) / parseFloat(firstHalf.Quantity));
    } else if (!firstHalfDirection && secondHalfDirection) {
        tradeToAdd.soldCurrency = firstHalf.Coin;
        tradeToAdd.boughtCurrency = secondHalf.Coin;
        tradeToAdd.amountSold = Math.abs(parseFloat(firstHalf.Quantity));
        tradeToAdd.rate = Math.abs(parseFloat(firstHalf.Quantity) / parseFloat(secondHalf.Quantity));
    } else {
        console.info(firstHalf);
        console.info(secondHalf);
        throw new Error(`Error parsing ${tradeToAdd.exchange} firstHalf.direction=${firstHalfDirection}
            and secondHalf.direction=${secondHalfDirection}`);
    }
    if (feeTrade !== undefined) {
        tradeToAdd.tradeFee = Math.abs(parseFloat(feeTrade.Quantity));
        tradeToAdd.tradeFeeCurrency = feeTrade.Coin;
    }
    tradeToAdd.ID = createID(tradeToAdd);
    tradeToAdd.exchangeID = tradeToAdd.ID;
    return tradeToAdd as ITrade;
}

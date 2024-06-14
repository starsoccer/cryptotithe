import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

interface IGateIO {
    No: string;
    'Account Type': string;
    Time: string;
    'Action type': string;
    Currency: string;
    'Order id': string;
    'Change amount': string;
    Amount: string;
    'Additional Info': string;
}

interface IGateIOGroup {
    [key: string]: IGateIO[];
}

function groupByOrderID(group: IGateIOGroup, line: IGateIO) {
    group[line['Order id']] = group[line['Order id']] ?? [];
    group[line['Order id']].push(line);
    return group;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IGateIO[] = await getCSVData(importDetails.data) as IGateIO[];
    const internalFormat: ITrade[] = [];
    const grouped = data.reduce(groupByOrderID, {});
    for (const order in grouped) {
        const trades = grouped[order];
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(trades[0].Time)).getTime(),
            exchangeID : order,
            exchange : EXCHANGES.GateIO,
        };
        switch (trades[0]['Action type']) {
            case 'Trading Fees': {
                for (let i = 0; i < trades.length; i += 3) {
                    let newTrade = tradeToAdd;
                    if (trades[i+1]['Action type'] !== 'Order Filled' || trades[i+2]['Action type'] !== 'Order Placed') {
                        console.error(`Error parsing ${newTrade.exchange} trade
                            trades[i+1]['Action type'] = ${trades[i+1]['Action type']}
                            trades[i+2]['Action type'] = ${trades[i+2]['Action type']}`);
                    }
                    newTrade.boughtCurrency = trades[i+1].Currency;
                    newTrade.soldCurrency = trades[i+2].Currency;
                    newTrade.amountSold = Math.abs(parseFloat(trades[i+2]['Change amount']));
                    newTrade.rate = Math.abs(parseFloat(trades[i+2]['Change amount']) / parseFloat(trades[1]['Change amount']));
                    newTrade.tradeFeeCurrency = trades[i].Currency;
                    newTrade.tradeFee = Math.abs(parseFloat(trades[i]['Change amount']));
                    newTrade.ID = createID(newTrade);
                    internalFormat.push(newTrade as ITrade);
                }
                break;
            }
            case 'Points Purchase': {
                if (trades[1]['Action type'] !== 'Points Purchase') {
                        console.error(`Error parsing ${tradeToAdd.exchange} points purchase
                            trades[1]['Action type'] = ${trades[1]['Action type']}`);
                }
                tradeToAdd.boughtCurrency = trades[0].Currency;
                tradeToAdd.soldCurrency = trades[1].Currency;
                tradeToAdd.amountSold = Math.abs(parseFloat(trades[1]['Change amount']));
                tradeToAdd.rate = Math.abs(parseFloat(trades[1]['Change amount']) /
                parseFloat(trades[0]['Change amount']));
                tradeToAdd.ID = createID(tradeToAdd);
                internalFormat.push(tradeToAdd as ITrade);
                break;
            }
            // TODO: Deposits, Airdrop, Withdrawals, Points With Expiration, Quant- Transferred In, Quant- Transferred Out
            default: {
                console.log(`Ignored Gate.io trade of type ${trades[0]['Action type']}`);
                continue;
            }
        }
    }
    return internalFormat;
}

import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createID } from '../../utils';

interface ICoinList {
    Date: string;
    Description: string;
    Asset: string;
    Amount: string;
    Balance: string;
}

interface ICoinListPro {
    portfolio: string;
    type: string;
    time: string;
    amount: string;
    balance: string;
    'amount/balance unit': string;
    transaction_id: string
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    if (importDetails.data.split(',')[0] === 'portfolio') {
        console.log('Detected CoinListPro')
        return processProData(importDetails);
    }
    const data: ICoinList[] = await getCSVData(importDetails.data) as ICoinList[];
    const internalFormat: ITrade[] = [];
    for (let i = 0; i < data.length; i++) {
        const trade = data[i];
        const tradeToAdd: IPartialTrade = {
            date : new Date(trade.Date).getTime(),
            exchange : EXCHANGES.CoinList,
        };
        let descriptionSplit = trade.Description.split(' ');
        let type = descriptionSplit[0];
        switch (type) {
            case 'Sold':
            case 'Bought': {
                i++;
                tradeToAdd.boughtCurrency = trade.Asset;
                tradeToAdd.soldCurrency = data[i].Asset;
                tradeToAdd.amountSold = Math.abs(parseFloat(data[i].Amount));
                tradeToAdd.rate = Math.abs(parseFloat(data[i].Amount) / parseFloat(trade.Amount));
                tradeToAdd.ID = createID(tradeToAdd);
                tradeToAdd.exchangeID = tradeToAdd.ID;
                internalFormat.push(tradeToAdd as ITrade);
                continue;
            }
            // TODO: Withdrawal, Distribution, Deposit, Hold
            default: {
                console.log(`Ignored ${tradeToAdd.exchange} trade of type ${type}`);
                break;
            }
        }
    }
    return internalFormat;
}

export async function processProData(importDetails: IImport): Promise<ITrade[]> {
    const data: ICoinListPro[] = await getCSVData(importDetails.data) as ICoinListPro[];
    const internalFormat: ITrade[] = [];
    for (let i = 0; i < data.length; i++) {
        const trade = data[i];
        const tradeToAdd: IPartialTrade = {
            date : new Date(trade.time).getTime(),
            exchange : EXCHANGES.CoinList,
        };
        switch (trade.type) {
            case 'match': {
                i++;
                tradeToAdd.boughtCurrency = trade.balance;
                tradeToAdd.tradeFee = Math.abs(parseFloat(data[i].amount));
                tradeToAdd.tradeFeeCurrency = data[i].balance;
                i++;
                tradeToAdd.soldCurrency = data[i].balance;
                tradeToAdd.amountSold = Math.abs(parseFloat(data[i].amount));
                tradeToAdd.rate = Math.abs(parseFloat(data[i].amount) / parseFloat(trade.amount));
                tradeToAdd.ID = createID(tradeToAdd);
                tradeToAdd.exchangeID = tradeToAdd.ID;
                internalFormat.push(tradeToAdd as ITrade);
                continue;
            }
            // TODO: deposit, withdrawal
            default: {
                console.log(`Ignored ${tradeToAdd.exchange} trade of type ${trade.type}`);
                break;
            }
        }
    }
    return internalFormat;
}

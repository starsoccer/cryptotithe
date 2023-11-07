import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

interface IRevolut {
    Type: string;
    Product: string;
    'Started Date': string;
    'Completed Date': string;
    Description: string;
    Amount: string;
    Currency: string;
    'Fiat amount': string;
    'Fiat amount (inc. fees)': string;
    Fee: string;
    'Base currency': string;
    State: string;
    Balance: string;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IRevolut[] = await getCSVData(importDetails.data) as IRevolut[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        if (trade.Type !== 'EXCHANGE') {
            console.log(`Not an exchange ${trade.Type}`);
            continue;
        }
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(trade['Completed Date'])).getTime(),
            exchange : EXCHANGES.Revolut,
        };
        const bought = trade.Description.substr(trade.Description.lastIndexOf(' ') + 1);
        if (bought === trade.Currency) {
            tradeToAdd.boughtCurrency = trade.Currency;
            tradeToAdd.soldCurrency = trade['Base currency'];
            tradeToAdd.amountSold = Math.abs(parseFloat(trade['Fiat amount']));
            tradeToAdd.rate = parseFloat(trade['Fiat amount']) / parseFloat(trade.Amount);
        } else if (bought === trade['Base currency']) {
            tradeToAdd.soldCurrency = trade.Currency;
            tradeToAdd.boughtCurrency = trade['Base currency'];
            tradeToAdd.amountSold = Math.abs(parseFloat(trade.Amount));
            tradeToAdd.rate = parseFloat(trade.Amount) / parseFloat(trade['Fiat amount']);
        } else {
            console.log(`Error bought "${bought}"`);
            console.log(`Error currency "${trade.Currency}"`);
            console.log(`Error base currency "${trade['Base currency']}"`);
            continue;
        }
        tradeToAdd.transactionFeeCurrency = trade['Base currency'];
        tradeToAdd.transactionFee = Math.round((parseFloat(trade['Fiat amount (inc. fees)'])-parseFloat(trade['Fiat amount']))*100)/100;
        tradeToAdd.ID = createID(tradeToAdd);
        tradeToAdd.exchangeID = tradeToAdd.ID;
        internalFormat.push(tradeToAdd as ITrade);
    }
    return internalFormat;
}

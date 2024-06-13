import { getCSVData } from '../../';
import { EXCHANGES, IImport, IPartialTrade, ITrade } from '../../../types';
import { createDateAsUTC, createID } from '../../utils';

enum ViteOrderSide {
    SELL = 'SELL ORDER',
    BUY = 'BUY ORDER',
}

interface IVite {
    address: string;
    orderId: string;
    symbol: string;
    tradeTokenSymbol: string;
    quoteTokenSymbol: string;
    side: string;
    price: string;
    quantity: string;
    amount: string;
    executedQuantity: string;
    executedAmount: string;
    executedPercent: string;
    executedAvgPrice: string;
    fee: string;
    status: string;
    type: string;
    createTime: string;
    dt: string;
}

export default async function processData(importDetails: IImport): Promise<ITrade[]> {
    const data: IVite[] = await getCSVData(importDetails.data) as IVite[];
    const internalFormat: ITrade[] = [];
    for (const trade of data) {
        const tradeToAdd: IPartialTrade = {
            date : createDateAsUTC(new Date(parseInt(trade.createTime)*1000)).getTime(),
            exchange : EXCHANGES.Vite,
            exchangeID : trade.orderId,
        };
        switch (trade.status) {
            case 'Filled': {
                switch (trade.side.toUpperCase()) {
                    case ViteOrderSide.BUY: {
                        tradeToAdd.boughtCurrency = trade.tradeTokenSymbol.split('-')[0];
                        tradeToAdd.soldCurrency = trade.quoteTokenSymbol.split('-')[0];
                        tradeToAdd.amountSold = parseFloat(trade.executedAmount);
                        tradeToAdd.rate = parseFloat(trade.executedAvgPrice);
                        break;
                    }
                    case ViteOrderSide.SELL: {
                        tradeToAdd.soldCurrency = trade.tradeTokenSymbol.split('-')[0];
                        tradeToAdd.boughtCurrency = trade.quoteTokenSymbol.split('-')[0];
                        tradeToAdd.amountSold = parseFloat(trade.executedQuantity);
                        tradeToAdd.rate = 1 / parseFloat(trade.executedAvgPrice);
                        break;
                    }
                    default: {
                        console.error(`Error parsing ${tradeToAdd.exchange} trade.
                            Unknown side ${trade.side}`);
                        continue;
                    }
                }
                tradeToAdd.ID = createID(tradeToAdd);
                internalFormat.push(tradeToAdd as ITrade);
                break;
            }
            case 'Cancelled': {
                console.log(`Skipping ${tradeToAdd.exchange} trade.
                    with status: ${trade.status}`)
                break;
            }
            default: {
                console.error(`Error parsing ${tradeToAdd.exchange} trade.
                    Unknown status ${trade.status}`);
                break;
            }
        }
    }
    return internalFormat;
}

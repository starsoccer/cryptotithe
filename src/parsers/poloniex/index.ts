import { getCSVData } from "../";
import path = require("path"); // path.resolve(__dirname, "settings.json"
import { ITradeWithUSDRate, ITradeWithGains, IHoldings, ICurrencyHolding, METHOD } from "../../types";
import { calculateGains } from "../../processing/CalculateGains";
import { getUSDRate } from "../getUSDRate";

enum PoloniexOrderType {
    BUY = "BUY",
    SELL = "SELL"
}

interface IPoloniex {
    Date: string;
    Market: string;
    Category: string;
    Type: PoloniexOrderType;
    Price: string;
    Amount: string;
    Total: string;
    Fee: string;
    "Order Number": string;
    "Base Total Less Fee": string;
    "Quote Total Less Fee": string;
}

export async function processData (filePath: string): Promise<ITradeWithUSDRate[]> {
    const data: IPoloniex[] = await getCSVData(filePath) as IPoloniex[];
    const internalFormat: ITradeWithUSDRate[] = [];
    for(const trade of data) {
        const pair: string[] = trade.Market.split("/");
        switch (trade.Type) {
            case PoloniexOrderType.BUY:
                internalFormat.push({
                    boughtCurreny: pair[0],
                    soldCurrency: pair[1],
                    amountSold: Math.abs(parseFloat(trade["Base Total Less Fee"])),
                    rate: parseFloat(trade.Price),
                    date: new Date(trade.Date),
                    USDRate: await getUSDRate(new Date(trade.Date)),
                });
            break;
            case PoloniexOrderType.SELL:
                internalFormat.push({
                    boughtCurreny: pair[1],
                    soldCurrency: pair[0],
                    amountSold: Math.abs(parseFloat(trade["Quote Total Less Fee"])),
                    rate: parseFloat(trade.Amount) * parseFloat(trade.Price),
                    date: new Date(trade.Date),
                    USDRate: await getUSDRate(new Date(trade.Date)) * parseFloat(trade.Price) / parseFloat(trade.Amount),
                });
            break;
            default:
                console.log("Unknown Order Type - " + trade["Order Number"]);
        }
    }
    return internalFormat;
}
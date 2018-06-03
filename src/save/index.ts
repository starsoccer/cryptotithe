import fs = require("fs");
import { IHoldings, ITrade } from "../types";

export async function save(holdings: IHoldings, trades: ITrade[]): Promise<any> {
    const data: string = JSON.stringify({
        savedDate: new Date,
        holdings,
        trades,
    });
    return new Promise(function(resolve: Function, reject: Function): void {
        fs.writeFile("./data.json", data, function(err: Error): void {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve();
        });
    });
}

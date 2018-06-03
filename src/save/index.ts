import * as fs from "fs";
import { IHoldings, ITrade } from "../types";

export async function save(holdings: IHoldings, trades: ITrade[]): Promise<any> {
    const data: string = JSON.stringify({
        savedDate: new Date(),
        holdings,
        trades,
    });
    return new Promise((resolve: () => void, reject: (Error) => void): void => {
        fs.writeFile("./data.json", data, (err: Error): void => {
            if (err) {
                // console.log(err);
                reject(err);
            }
            resolve();
        });
    });
}

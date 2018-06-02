import fs = require('fs');
import { IHoldings, ITrade } from '../types';

export async function save(holdings: IHoldings, trades: ITrade[]) {
    const data = JSON.stringify({
        savedDate: new Date,
        holdings: holdings,
        trades: trades,
    });
    return new Promise(function(resolve, reject) {
        fs.writeFile("./data.json", data, function(err) {
            if(err) {
                console.log(err);
                reject(err);
            }
            resolve();
        }); 
    });
}
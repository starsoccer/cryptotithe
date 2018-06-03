import * as csv from "csvtojson";
import fs = require("fs");
import { EXCHANGES } from "../types";

interface IGetCSVData {
    [key: string]: string;
}

export async function getCSVData(filePath: string): Promise<any> {
    return new Promise( function(resolve: Function, reject: Function): any {
        const promises: Array<Promise<IGetCSVData[]>> = [];
        csv().fromFile(filePath)
          .on("json", (converted) => promises.push(Promise.resolve(converted)))
          .on("done", (error) => {
            if (error) {
              reject(error);
            }
            Promise.all(promises).then((convertedResults) => resolve(convertedResults));
        });
    });
}

export async function processData(exchange: keyof typeof EXCHANGES, filePath: string): Promise<string> {
    let processData: Function;
    switch (exchange) {
        case "BITTREX":
            processData = require("./bittrex").processData;
            break;
        case "GEMINI":
            processData = require("./gemini").processData;
            break;
        default:
            console.log(`Unknown Exchange - ${exchange}`);
            return;
    }
}

import * as csv from "csvtojson";
import fs = require("fs");
import { EXCHANGES } from "../types";

interface IGetCSVData {
    [key: string]: string;
}

export async function getCSVData(filePath: string): Promise<any> {
    return new Promise((resolve: (data: IGetCSVData[][]) => void, reject: (Error) => void): any => {
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

export async function processData(exchange: keyof typeof EXCHANGES, filePath: string): Promise<any> {
    let processExchangeData: any;
    switch (exchange) {
        case "BITTREX":
            processExchangeData = require("./bittrex").processData;
            break;
        case "GEMINI":
            processExchangeData = require("./gemini").processData;
            break;
        default:
            throw new Error(`Unknown Exchange - ${exchange}`);
    }
}

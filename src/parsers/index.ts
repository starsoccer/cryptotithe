import * as csv from 'csvtojson';
import fs = require('fs');
import { EXCHANGES } from '../types';

export async function getCSVData(filePath: string) {
    return new Promise( function(resolve, reject) {
        const promises = []
        csv().fromFile(filePath)
          .on('json', converted => promises.push(Promise.resolve(converted)))
          .on('done', error => {
            if (error) {
              reject(error)
              return
            }
          Promise.all(promises).then(convertedResults => resolve(convertedResults))
        })
    });
}


export async function processData(exchange: keyof typeof EXCHANGES, filePath: string) {
    let processData = undefined;
    switch (exchange) {
        case 'BITTREX':
            processData = require('./bittrex').processData;
        break;
        case 'GEMINI':
            processData = require('./gemini').processData;
        break;
        default:
            console.log(`Unknown Exchange - ${exchange}`);
            return;
    }
}
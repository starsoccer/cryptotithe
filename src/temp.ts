import { ITradeWithGains } from './types';
import { calculateGains } from './processing/calculateGains';

const internalFormat= [];
const finalFormat: ITradeWithGains[] = [];
let tempHoldings = {};
for(const trade of internalFormat) {
    console.log(tempHoldings);
    const result = calculateGains(tempHoldings, [trade]);
    tempHoldings = result.newHoldings;
    finalFormat.push({
        ...trade,
        shortTerm: result.shortTermGain,
        longTerm: result.longTermGain,
    })
}
console.log(JSON.stringify(finalFormat));
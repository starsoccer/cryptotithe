import { calculateGainsPerHoldings } from '../../processing/CalculateGains';
import { IHoldings, ITradeWithCostBasis, ITradeWithGains } from '../../types';

const headers = [
    'Description',
    'Date Acquired',
    'Date Sold',
    'Proceeds',
    'Cost Basis',
    'Adjustment Code',
    'Adjustment Amount',
    'Gain or Loss',
].join(',');

export default function outputForm8949(holdings: IHoldings, trades: ITradeWithGains[]) {
    const holdingsTrades: ITradeWithCostBasis[] = calculateGainsPerHoldings(holdings, trades);
    const shortTermTrades = holdingsTrades.filter((trade) => trade.shortTerm !== 0);
    const longTermTrades = holdingsTrades.filter((trade) => trade.longTerm !== 0);
    let csvData: any[] = [
        'Form 8949 Statement',
        '',
        'Part 1 (Short-Term)',
    ];
    csvData = csvData.concat(headers);
    csvData = csvData.concat(shortTermTrades.map((trade) => [
        `${trade.amountSold / trade.rate} ${trade.boughtCurrency}`,
        new Date(trade.dateAcquired),
        new Date(trade.date),
        trade.USDRate * trade.amountSold,
        (trade.USDRate * trade.amountSold) - trade.shortTerm,
        null,
        null,
        trade.shortTerm,
    ]));
    csvData = csvData.concat(['', 'Part 2 (Long Term)']).concat(headers);
    csvData = csvData.concat(longTermTrades.map((trade) => [
        `${trade.amountSold / trade.rate} ${trade.boughtCurrency}`,
        new Date(trade.dateAcquired),
        new Date(trade.date),
        trade.USDRate * trade.amountSold,
        (trade.USDRate * trade.amountSold) - trade.shortTerm,
        null,
        null,
        trade.longTerm,
    ]));
    return csvData.join('\n');
}

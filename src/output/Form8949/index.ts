import { calculateGainsPerHoldings } from '../../processing/CalculateGains';
import { IHoldings, ITradeWithUSDRate, METHOD } from '../../types';

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

export default function outputForm8949(holdings: IHoldings, trades: ITradeWithUSDRate[], method: METHOD) {
    const result = calculateGainsPerHoldings(holdings, trades, method);
    let csvData: any[] = [
        'Form 8949 Statement',
        '',
        'Part 1 (Short-Term)',
    ];
    csvData = csvData.concat(headers);
    csvData = csvData.concat(result.shortTermTrades.map((trade) => [
        `${trade.amountSold} ${trade.soldCurrency}`,
        new Date(trade.dateAcquired).toLocaleDateString(),
        new Date(trade.date).toLocaleDateString(),
        (trade.costBasis + trade.shortTerm).toFixed(2),
        (trade.costBasis).toFixed(2),
        null,
        null,
        (trade.shortTerm).toFixed(2),
    ]));
    csvData = csvData.concat([
        'Totals', '', '', result.shortTermProceeds.toFixed(2),
        result.shortTermCostBasis.toFixed(2), '', 0, result.shortTermGain.toFixed(2)].join(','));
    csvData = csvData.concat(['', 'Part 2 (Long Term)']).concat(headers);
    csvData = csvData.concat(result.longTermTrades.map((trade) => [
        `${trade.amountSold} ${trade.soldCurrency}`,
        new Date(trade.dateAcquired).toLocaleDateString(),
        new Date(trade.date).toLocaleDateString(),
        (trade.costBasis + trade.longTerm).toFixed(2),
        (trade.costBasis).toFixed(2),
        null,
        null,
        (trade.longTerm).toFixed(2),
    ]));
    csvData = csvData.concat([
        'Totals', '', '', result.longTermProceeds.toFixed(2),
        result.longTermCostBasis.toFixed(2), '', 0, result.longTermGain.toFixed(2)].join(','));
    return csvData.join('\n');
}

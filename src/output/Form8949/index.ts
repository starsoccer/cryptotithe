import { calculateGainsPerHoldings } from '../../processing/CalculateGains';
import { IHoldings, ITradeWithUSDRate } from '../../types';

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

export default function outputForm8949(holdings: IHoldings, trades: ITradeWithUSDRate[]) {
    const result = calculateGainsPerHoldings(holdings, trades);
    let csvData: any[] = [
        'Form 8949 Statement',
        '',
        'Part 1 (Short-Term)',
    ];
    csvData = csvData.concat(headers);
    csvData = csvData.concat(result.shortTermTrades.map((trade) => [
        `${trade.amountSold} ${trade.soldCurrency} sold for ${trade.amountSold / trade.rate} ${trade.boughtCurrency}`,
        new Date(trade.dateAcquired),
        new Date(trade.date),
        trade.USDRate * trade.amountSold,
        trade.costBasis,
        null,
        null,
        trade.shortTerm,
    ]));
    csvData = csvData.concat(['Totals', '', '', result.shortTermProceeds, result.shortTermCostBasis, '', 0, result.shortTermGain].join(','));
    csvData = csvData.concat(['', 'Part 2 (Long Term)']).concat(headers);
    csvData = csvData.concat(result.longTermTrades.map((trade) => [
        `${trade.amountSold} ${trade.soldCurrency} sold for ${trade.amountSold / trade.rate} ${trade.boughtCurrency}`,
        new Date(trade.dateAcquired),
        new Date(trade.date),
        trade.USDRate * trade.amountSold,
        trade.costBasis,
        null,
        null,
        trade.longTerm,
    ]));
    csvData = csvData.concat(['Totals', '', '', result.longTermProceeds, result.longTermCostBasis, '', 0, result.longTermGain].join(','));
    return csvData.join('\n');
}

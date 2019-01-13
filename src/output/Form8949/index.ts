import { calculateGainsPerHoldings } from '../../processing/CalculateGains';
import { IHoldings, ITradeWithCostBasis, ITradeWithFiatRate, METHOD } from '../../types';

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

export default function outputForm8949(
    holdings: IHoldings,
    trades: ITradeWithFiatRate[],
    fiatCurrency: string,
    method: METHOD,
) {
    const result = calculateGainsPerHoldings(holdings, trades, fiatCurrency, method);
    let csvData: any[] = [
        'Form 8949 Statement',
        '',
        'Part 1 (Short-Term)',
    ];
    csvData = csvData.concat(headers);
    csvData = csvData.concat(addTrades(result.shortTermTrades));
    // csvData = csvData.concat(addTotal(result.shortTermProceeds, result.shortTermCostBasis, result.shortTermGain));
    csvData = csvData.concat(['', 'Part 2 (Long Term)']).concat(headers);
    csvData = csvData.concat(addTrades(result.longTermTrades));
    // csvData = csvData.concat(addTotal(result.longTermProceeds, result.longTermCostBasis, result.longTermGain));
    return csvData.join('\n');
}

const fiatCurrencyDecimal = (value: number) => parseFloat(value.toFixed(2));

function addTrades(trades: ITradeWithCostBasis[]) {
    let trueProceeds = 0;
    let roundedProceeds = 0;
    let trueCostbasis = 0;
    let roundedCostbasis = 0;
    const temp = trades.map((trade) => {
        let proceeds = trade.costBasis + trade.longTerm + trade.shortTerm;
        let costbasis = trade.costBasis;
        let gain = trade.longTerm + trade.shortTerm;
        trueProceeds += proceeds;
        trueCostbasis += costbasis;

        roundedProceeds += parseFloat(proceeds.toFixed(2));
        roundedCostbasis += parseFloat(costbasis.toFixed(2));

        if (trueProceeds - roundedProceeds >= 0) {
            roundedProceeds += 0.01;
            proceeds += 0.01;
            gain += 0.01;
        }

        if (trueProceeds - roundedProceeds <= 0) {
            roundedProceeds -= 0.01;
            proceeds -= 0.01;
            gain -= 0.01;
        }

        if (trueCostbasis - roundedCostbasis >= 0) {
            roundedCostbasis += 0.01;
            costbasis += 0.01;
            gain += 0.01;
        }

        if (trueCostbasis - roundedCostbasis <= 0) {
            roundedCostbasis -= 0.01;
            costbasis -= 0.01;
            gain -= 0.01;
        }

        if ((fiatCurrencyDecimal(proceeds) - fiatCurrencyDecimal(costbasis)).toFixed(2)
            !== fiatCurrencyDecimal(gain).toFixed(2)
        ) {
            gain = parseFloat((fiatCurrencyDecimal(proceeds) - fiatCurrencyDecimal(costbasis)).toFixed(2));
        }

        return [
            `${trade.amountSold} ${trade.soldCurrency}`,
            new Date(trade.dateAcquired).toLocaleDateString(),
            new Date(trade.date).toLocaleDateString(),
            (proceeds).toFixed(2),
            (costbasis).toFixed(2),
            null,
            null,
            (gain).toFixed(2),
        ];
    });

    return temp.concat([[
        'Totals', '', '',
        roundedProceeds.toFixed(2), roundedCostbasis.toFixed(2), '',
        '0', (roundedProceeds - roundedCostbasis).toFixed(2),
    ]]);
}

import { ISavedData } from '../../types';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;
    if (0 in savedData.trades) {
        if (
            'transactionFee' in savedData.trades[0] === false ||
            'transactionFeeCurrency' in savedData.trades[0] === false
        ) {
            changeMade = true;
            for (const trade of savedData.trades) {
                trade.transactionFee = 0;
                trade.transactionFeeCurrency = trade.boughtCurrency;
            }
        }
    }

    return changeMade;
}

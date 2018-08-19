import { ISavedData } from '../../types';
import { createTradeID } from '../../parsers/utils';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;
    if (0 in savedData.trades) {
        if ('ID' in savedData.trades[0] === false || 'exchangeID' in savedData.trades[0] === false) {
            changeMade = true;
            for(const trade of savedData.trades) {
                trade.exchangeID = (trade as any).id;
                delete (trade as any).id;
                trade.ID = createTradeID(trade);
            }
            // confirm no duplicates
            for(const trade of savedData.trades) {
                const duplicateIDs = savedData.trades.filter((filteredTrade) => filteredTrade.ID === trade.ID);
                if (duplicateIDs.length !== 0) {
                    for(const matchedIDTrade of duplicateIDs) {
                        while (createTradeID(matchedIDTrade) === trade.ID) {
                            
                        }
                        matchedIDTrade.ID = createTradeID(matchedIDTrade);
                    }
                }
            }
        }
    }

    return changeMade;
}

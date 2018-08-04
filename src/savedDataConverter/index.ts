import { ISavedData } from "../types";
import zeroTwoZeroConverter from './0.2.0';

export default function onSaveDataLoaded (savedData: ISavedData): boolean { 
    const version = savedData.version || undefined;
    const packageData = require('./package.json');
    const currentVersion = packageData.version;
    let changeMade = false;
    switch (version) {
        case undefined: // prior to 0.2.0
            changeMade = zeroTwoZeroConverter(savedData);
        break;
        default:
    }
    if (changeMade && version === undefined || version < currentVersion) {
        savedData.version = currentVersion;
    }

    return changeMade;
}
import { ISavedData } from '../types';
import integrityCheck from '../utils/integrityCheck';
import zeroTwoZeroConverter from './0.2.0';
import zeroThreeZeroConverter from './0.3.0';
import zeroFourZeroConverter from './0.4.0';
import zeroFiveZeroConverter from './0.5.0';
import zeroSixZeroConverter from './0.6.0';
import zeroSevenZeroConverter from './0.7.0';
import zeroEightZeroConverter from './0.8.0';
import { version } from '@package';

export default function onSaveDataLoaded(savedData: ISavedData): boolean {
    const savedVersion = isNaN(parseFloat(savedData.version)) ? 0 : parseFloat(savedData.version);
    let changeMade = false;

    const versionUpgraders: {[key: number]: (data: ISavedData) => boolean} = {
        [0.2]: zeroTwoZeroConverter,
        [0.3]: zeroThreeZeroConverter,
        [0.4]: zeroFourZeroConverter,
        [0.5]: zeroFiveZeroConverter,
        [0.6]: zeroSixZeroConverter,
        [0.7]: zeroSevenZeroConverter,
        [0.8]: zeroEightZeroConverter
    };
    const versions = Object.keys(versionUpgraders);
    for (const version of versions) {
        if (savedVersion < parseFloat(version)) {
            changeMade = versionUpgraders[version](savedData) || changeMade;
        }
    }

    const currentVersion = parseFloat(version);
    if (changeMade && !savedVersion || savedVersion < currentVersion) {
        savedData.version = currentVersion.toString();
        savedData.integrity = integrityCheck(savedData);
    }

    return changeMade;
}

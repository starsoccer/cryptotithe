import { ISavedData, METHOD } from '../../types';

export default function converter(savedData: ISavedData): boolean {
    let changeMade = false;
    if ('gainCalculationMethod' in savedData.settings === false) {
        changeMade = true;
        savedData.settings.gainCalculationMethod = METHOD.FIFO;
    }

    return changeMade;
}

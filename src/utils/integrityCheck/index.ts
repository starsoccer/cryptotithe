import clone from 'clone';
import * as crypto from 'crypto';
import { ISavedData } from './../../types';

export default function integrityCheck(savedData: ISavedData) {
    const clonedData = clone(savedData);
    if ('integrity' in clonedData) {
        // eslint-disable-next-line
        // @ts-ignore 
        delete clonedData.integrity;
    }

    // make sure keys are in same order prior to hashing, as objects do not store them in the same way consistently
    const dataKeys = Object.keys(clonedData).sort();
    const integrityArray = [];
    for (const key of dataKeys) {
        integrityArray.push(crypto.createHash('sha256').update(
            JSON.stringify(clonedData[key]),
        ).digest('hex'));
    }

    return crypto.createHash('sha256').update(
        integrityArray.join('-'),
    ).digest('hex');
}

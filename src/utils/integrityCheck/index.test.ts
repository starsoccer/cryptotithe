import { createEmptySavedData } from '../../mock';
import integrityCheck from './';

describe('Integrity Check', () => {
    test('Basic check', () => {
        const savedData = createEmptySavedData();
        savedData.savedDate = new Date(0);

        expect(integrityCheck(savedData)).toBe('3cd2ec02c08ae29da7e3b853f7c032b02c0f84fc85704b0e72daa873ef078ac9');
    });
});

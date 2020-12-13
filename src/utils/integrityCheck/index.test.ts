import { createEmptySavedData } from '../../mock';
import integrityCheck from './';

describe('Integrity Check', () => {
    test('Basic check', () => {
        const savedData = createEmptySavedData();
        savedData.savedDate = new Date(0);

        expect(integrityCheck(savedData)).toBe('4fb5283dccdd28fba64372dcdf5f7881e558f7f31facc429fb1f23685c24214e');
    });
});

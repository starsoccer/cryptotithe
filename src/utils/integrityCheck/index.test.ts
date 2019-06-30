import { createEmptySavedData } from '../../mock';
import integrityCheck from './';

describe('Integrity Check', () => {
    test('Basic check', () => {
        const savedData = createEmptySavedData();
        savedData.savedDate = new Date(0);

        expect(integrityCheck(savedData)).toBe('dab74f8e5b0d4d729c6bb52c2281fa053de7c0f907966c7c11bd939571e0e799');
    });
});

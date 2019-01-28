import { createEmptySavedData } from '../../mock';
import integrityCheck from './';

describe('Integrity Check', () => {
    test('Basic check', () => {
        const savedData = createEmptySavedData();
        savedData.savedDate = new Date(0);

        expect(integrityCheck(savedData)).toBe('a3d58abc61d09bf74face84527fb1c6a80450bc0f3de66e60bd740222cc22784');
    });
});

import { IPartialSavedData, ISavedData } from '@types';
import { createContext } from 'react';

export interface ISavedDataConext {
    save: (data: IPartialSavedData) => Promise<boolean>;
    savedData: ISavedData;
}

const savedDataContext = createContext({} as ISavedDataConext);

export default savedDataContext;
import { FileBrowse } from '@components/FileBrowse';
import savedDataConverter from '../src/savedDataConverter';
import integrityCheck from '@utils/integrityCheck';
import { Dialog, Button, Intent } from "@blueprintjs/core";
import { IHoldingsValueComplex, ISavedData, Pages } from '@types';
import { useState } from 'react';
import { createEmptySavedData } from 'src/mock';
import { useRouter } from 'next/router';

export interface IIndexProps {
    updateSaveData: (savedData: ISavedData, shouldDownload?: Boolean) => void;
}

const isSavedDataLoaded = (data: ISavedData) => data && data.trades.length + Object.keys(data.holdings).length > 0;

const Index = ({ updateSaveData }: IIndexProps) => {
    const [showLoadDataPopup, setShowLoadDataPopup] = useState(true);
    const [shouldOpenFileBrowse, setShouldOpenFileBrowse] = useState(false);
    const router = useRouter();

    const loadData = (savedData: ISavedData) => {
        setShouldOpenFileBrowse(false);
        if (isSavedDataLoaded(savedData)) {
            if ('integrity' in savedData && integrityCheck(savedData) !== savedData.integrity) {
                alert('Integrity Check Failed. Your save file might be corrupt or tampered with.');
            }
            const shouldSave = savedDataConverter(savedData);
            updateSaveData(savedData, shouldSave);
            setShowLoadDataPopup(false);
        }
      }
    
      const onDataLoaded = (data: string) => {
        if (data !== '') {
          try {
              const parsedData: ISavedData = JSON.parse(data);
              loadData(parsedData);
              router.push(Pages.portfolio);
          } catch (ex) {
              alert('Unable to parse saved data');
          }
        }
      }
      
      const onCreateNew = () => {
        updateSaveData(createEmptySavedData());
        setShowLoadDataPopup(false);
        router.push(Pages.portfolio);
      }

    return (
        <div className='portfolio'>
        <Dialog
          onClose={() => setShowLoadDataPopup(false)}
          isOpen={showLoadDataPopup}
          icon="info-sign"
          title="Welcome to CryptoTithe"
          isCloseButtonShown={false}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          <div className="ph2">
            <h4>
              CryptoTithe is intended to be a simple and easy to use open source software to handle tax reporting and monitoring of your portfolio
            </h4>
            <div className="flex justify-around">
              <Button intent={Intent.PRIMARY} icon="floppy-disk" onClick={() => setShouldOpenFileBrowse(true)}>Load Existing Data</Button>
              <Button intent={Intent.PRIMARY} icon="add" onClick={onCreateNew}>Create Save Data</Button>
            </div>
            <FileBrowse
                onLoaded={onDataLoaded}
                browse={shouldOpenFileBrowse}
            />
          </div>
        </Dialog>
        </div>
    );
};


export default Index;
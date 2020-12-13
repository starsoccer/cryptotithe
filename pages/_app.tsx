import 'index.css';
import '@tachyons/css/tachyons.min.css';
import '@font-awesome/css/font-awesome.min.css';
import { AppProps } from 'next/app'
import SavedDataConext from '@contexts/savedData';
import DownloadContext from '@contexts/download';
import { createEmptySavedData } from 'src/mock';
import { useEffect, useState } from 'react';
import save from 'src/save';
import { IPartialSavedData, ISavedData } from '@types';
import Header from '@components/Header';
import { FileDownload, IFileDownloadProps } from '@components/FileDownload';
import Popup from '@components/Popup';
import Button from '@components/Button';
import { FileBrowse } from '@components/FileBrowse';
import savedDataConverter from '../src/savedDataConverter';
import integrityCheck from '@utils/integrityCheck';

const isSavedDataLoaded = (data: ISavedData) => data && data.trades.length + Object.keys(data.holdings).length > 0;

function MyApp({ Component, pageProps }: AppProps) { 
  const [savedData, setSavedData] = useState(createEmptySavedData());
  const [showLoadDataPopup, setShowLoadDataPopup] = useState(true);
  const [shouldOpenFileBrowse, setShouldOpenFileBrowse] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<IFileDownloadProps>({
    data: '',
    fileName: '',
    download: false,
  });

  const updateSaveData = async (data: IPartialSavedData, shouldDownload: boolean = true): Promise<boolean> => {
    const newSavedData = save(data, savedData);

    if (shouldDownload) {
      setDownloadInfo({
        data: JSON.stringify(newSavedData),
        fileName: 'data.json',
        download: true,
      });
    }

    try {
        setSavedData(newSavedData);
        return true;
    } catch (err) {
        alert(err);
        return false;
    }
  };

  useEffect(() => {
    if (downloadInfo.download) {
      setDownloadInfo({
        data: '',
        fileName: '',
        download: false,
      })
    }
  }, [downloadInfo]);

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
      } catch (ex) {
          alert('Unable to parse saved data');
      }
    }
  }
  
  const onCreateNew = () => {
    updateSaveData(createEmptySavedData());
    setShowLoadDataPopup(false);
  }

  return (
    <SavedDataConext.Provider value={{
      save: updateSaveData,
      savedData,
    }}>
      <DownloadContext.Provider value={{
        downloadInfo,
        setDownloadInfo,
      }}>
        <Header/>
        <FileDownload
            data={downloadInfo.data}
            fileName={downloadInfo.fileName}
            download={downloadInfo.download}
        />

        {showLoadDataPopup &&
          <Popup onClose={() => setShowLoadDataPopup(false)}>
              <div>
                  <h1>Welcome to CryptoTithe</h1>
                  <h5>Great Description to be put here</h5>
                  <Button label='Load Existing Data' onClick={() => setShouldOpenFileBrowse(true)}/>
                  <Button label='Create Save Data' onClick={onCreateNew}/>
                  <FileBrowse
                      onLoaded={onDataLoaded}
                      browse={shouldOpenFileBrowse}
                  />
              </div>
          </Popup>
        }

        <Component
          {...pageProps}
          updateSaveData={updateSaveData}
          savedData={savedData}
        />
      </DownloadContext.Provider>
    </SavedDataConext.Provider>
  )
}

export default MyApp
import 'index.css';
import '@tachyons/css/tachyons.min.css';
import '@font-awesome/css/font-awesome.min.css';
import { AppProps } from 'next/app'
import SavedDataConext from '@contexts/savedData';
import { createEmptySavedData } from 'src/mock';
import { useEffect, useState } from 'react';
import save from 'src/save';
import { IPartialSavedData } from '@types';
import Header from '@components/Header';
import {TABS} from './index';
import { useRouter } from 'next/router';
import { FileDownload, IFileDownloadProps } from '@components/FileDownload';
import Portfolio from '@pages/portfolio';
import Index from './index';

function MyApp({ Component, pageProps }: AppProps) { 
  const [savedData, setSavedData] = useState(createEmptySavedData());
  const [currentTab, setCurrentTab] = useState<TABS>();
  const [downloadInfo, setDownloadInfo] = useState<IFileDownloadProps>({
    data: '',
    fileName: 'data.json',
    download: false,
  });
  const router = useRouter();

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
        fileName: 'data.json',
        download: false,
      })
    }
  }, [downloadInfo]);

  const fallbackToPortfolio = (
      !currentTab &&
      router.pathname !== '/trades' &&
      router.pathname !== '/incomes' &&
      router.pathname === '/'
    );

  return (
    <SavedDataConext.Provider value={{
      save: updateSaveData,
      savedData,
    }}>
      <Header
        onUpdateTab={setCurrentTab}
        currentTab={currentTab}
        save={updateSaveData}
      />
      { downloadInfo &&
        <FileDownload
            data={downloadInfo.data}
            fileName={downloadInfo.fileName}
            download={downloadInfo.download}
        />
      }

      {fallbackToPortfolio && 
        <Portfolio
          {...pageProps}
          updateSaveData={updateSaveData}
          savedData={savedData}
          currentTab={currentTab}
        />
      }

      {currentTab ?
        <Index
          {...pageProps}
          updateSaveData={updateSaveData}
          savedData={savedData}
          currentTab={currentTab}
        />
      :
        <Component
          {...pageProps}
          updateSaveData={updateSaveData}
          savedData={savedData}
          currentTab={currentTab}
        />
      }

    </SavedDataConext.Provider>
  )
}

export default MyApp
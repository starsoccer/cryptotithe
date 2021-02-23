import 'index.css';
import '@tachyons/css/tachyons.min.css';
import '@font-awesome/css/font-awesome.min.css';
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { AppProps } from 'next/app'
import SavedDataConext from '@contexts/savedData';
import DownloadContext from '@contexts/download';
import { createEmptySavedData } from 'src/mock';
import { useEffect, useState } from 'react';
import save from 'src/save';
import { IPartialSavedData, Pages } from '@types';
import Header from '@components/Header';
import { FileDownload, IFileDownloadProps } from '@components/FileDownload';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const [savedData, setSavedData] = useState(createEmptySavedData());
  const [downloadInfo, setDownloadInfo] = useState<IFileDownloadProps>({
    data: '',
    fileName: '',
    download: false,
  });
  const router = useRouter();

  useEffect(() => {
    router.push(Pages.index);
  }, []);


  const updateSaveData = async (data: IPartialSavedData, shouldDownload = true): Promise<boolean> => {
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
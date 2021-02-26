import 'index.css';
import '@tachyons/css/tachyons.min.css';
import '@font-awesome/css/font-awesome.min.css';
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { AppProps } from 'next/app'
import SavedDataConext from '@contexts/savedData';
import { createEmptySavedData } from 'src/mock';
import { useEffect, useState } from 'react';
import save from 'src/save';
import { IPartialSavedData, Pages } from '@types';
import Header from '@components/Header';
import { useRouter } from 'next/router';
import downloadFile from '@utils/downloadFile';

function MyApp({ Component, pageProps }: AppProps) {
  const [savedData, setSavedData] = useState(createEmptySavedData());
  const router = useRouter();

  useEffect(() => {
    router.push(Pages.index);
  }, []);


  const updateSaveData = async (data: IPartialSavedData, shouldDownload = true): Promise<boolean> => {
    const newSavedData = save(data, savedData);

    if (shouldDownload) {
      downloadFile(JSON.stringify(newSavedData), 'data.json');
    }

    try {
        setSavedData(newSavedData);
        return true;
    } catch (err) {
        alert(err);
        return false;
    }
  };


  return (
    <SavedDataConext.Provider value={{
      save: updateSaveData,
      savedData,
    }}>
      <Header/>

      <Component
        {...pageProps}
        updateSaveData={updateSaveData}
        savedData={savedData}
      />
    </SavedDataConext.Provider>
  )
}

export default MyApp
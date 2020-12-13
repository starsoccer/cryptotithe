import { createContext } from 'react';
import { IFileDownloadProps } from '@components/FileDownload';

export interface IDownloadContext {
    downloadInfo: IFileDownloadProps,
    setDownloadInfo: (downloadInfo: IFileDownloadProps) => void;
}

const downloadContext = createContext({} as IDownloadContext);

export default downloadContext;
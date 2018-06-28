import * as React from 'react';
export interface IFileDownloadProps {
    data: string;
    fileName: string;
    download: boolean;
}

export class FileDownload extends React.Component<IFileDownloadProps> {
    private downloadLink: React.RefObject<HTMLAnchorElement>;

    constructor(props: IFileDownloadProps) {
        super(props);
        this.downloadLink = React.createRef();
    }

    public componentDidUpdate() {
        if (this.props.download) {
            if (this.downloadLink.current !== null) {
                this.downloadLink.current.click();
            } else {
                alert('error clickng file input');
            }
        }
    }

    public render() {
        return (
            <a
                download={this.props.fileName}
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(this.props.data)}`}
                ref={this.downloadLink}
                className='dn'
            />
        );
    }
}

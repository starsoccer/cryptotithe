import * as React from 'react';
export interface IFileBrowseProps {
    onLoaded: (data: string) => void;
    browse: boolean;
}

export class FileBrowse extends React.Component<IFileBrowseProps> {
    private fileInput: React.RefObject<HTMLInputElement>;

    constructor(props: IFileBrowseProps) {
        super(props);
        this.fileInput = React.createRef();
    }

    public componentDidUpdate() {
        if (this.props.browse) {
            this.selectFile();
        }
    }

    public selectFile = () => {
        if (this.fileInput.current !== null) {
            this.fileInput.current.click();
        } else {
            alert('error clickng file input');
        }
    }

    public onSubmit = async (): Promise<void> => {
        this.setState({processing: true});
        const reader = new FileReader();
        reader.onload = () => this.props.onLoaded(reader.result);
        if (this.fileInput.current !== null) {
            if (this.fileInput.current.files !== null) {
                await reader.readAsText(this.fileInput.current.files[0]);
            }
        }
    }

    public render() {
        return (
            <input
                type='file'
                className='FileBrowse dn'
                ref={this.fileInput}
                onChange={this.onSubmit}
            />
        );
    }
}

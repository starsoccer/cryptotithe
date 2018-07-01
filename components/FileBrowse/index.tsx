import * as React from 'react';
export interface IFileBrowseProps {
    onLoaded(data: string, input?: React.RefObject<HTMLInputElement>, reader?: FileReader): void;
    browse: boolean;
}

export class FileBrowse extends React.Component<IFileBrowseProps> {
    private readonly fileInput: React.RefObject<HTMLInputElement>;
    private onetime = true;
    public constructor(props: IFileBrowseProps) {
        super(props);
        this.fileInput = React.createRef();
    }

    public componentDidUpdate(prevProps: IFileBrowseProps) {
        // complicated 3 boolean logic to stop some browsers(firefox/edge) from causing 2 popup windows
        if (this.props.browse) {
            if (!prevProps.browse || this.onetime) {
                if (!this.onetime && prevProps.browse) {
                    this.onetime = !this.onetime;
                }
                if (this.fileInput.current !== null) {
                    this.fileInput.current.click();
                } else {
                    alert('error clickng file input');
                }
            } else {
                if (this.onetime && !prevProps.browse) {
                    this.props.onLoaded('');
                }
                this.onetime = !this.onetime;
            }
        } // this set state valid once
    }

    public onSubmit = async (): Promise<void> => {
        const reader = new FileReader();
        reader.onload = () => this.props.onLoaded(reader.result, this.fileInput, reader);
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

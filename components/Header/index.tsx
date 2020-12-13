import classnames from 'classnames';
import { TABS } from '@pages/index';
import { Settings } from '@components/Tabs/Settings';
import { useContext } from 'react';
import SavedDataConext from '@contexts/savedData';

export interface IHeaderProps {
    onSettingsClick: () => void;
    showSettingsPopup: boolean;
    onUpdateTab: (tab: TABS) => void;
    currentTab: TABS;
}

const Header = ({onUpdateTab, currentTab, onSettingsClick, showSettingsPopup}: IHeaderProps) => {
    const {savedData, save} = useContext(SavedDataConext);

    return (
        <div className="heaader">
            <i className='fa fa-cog fa-2x moon-gray fr pr1 bg-dark-gray' onClick={onSettingsClick}/>
            <div className='flex bg-dark-gray h2'>
                {Object.keys(TABS).map((key: string) => <h3
                    key={key}
                    className={classnames('pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0', {
                        'bg-dark-gray': TABS[key] !== currentTab,
                        'bg-navy': TABS[key] === currentTab,
                    })}
                    onClick={() => onUpdateTab(TABS[key])}
                >{key}</h3>)}
            </div>

            { showSettingsPopup &&
                <Settings
                    settings={savedData.settings}
                    onSave={save}
                    onClose={onSettingsClick}
                />
            }
        </div>
    );
};

export default Header
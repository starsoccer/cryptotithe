import classnames from 'classnames';
import { TABS } from '@pages/index';
import { Settings } from '@components/Tabs/Settings';
import { useContext, useState } from 'react';
import SavedDataConext from '@contexts/savedData';
import { Pages } from '@types';
import { NextRouter, useRouter } from 'next/router';

export interface IHeaderProps {
    onUpdateTab: (tab?: TABS) => void;
    currentTab?: TABS;
}

const getPageClassNames = (page: Pages, router: NextRouter, currentTab?: TABS) => classnames(
    'pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0',
    {
        'bg-dark-gray': page !== router.pathname,
        'bg-navy': page === router.pathname && !currentTab,
    }
);

const Header = ({onUpdateTab, currentTab}: IHeaderProps) => {
    const {savedData, save} = useContext(SavedDataConext);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const router = useRouter();

    const onPageClick = (page: Pages, tab?: TABS) => () => {
        onUpdateTab(tab);
        router.push(page);
    }

    return (
        <div className="heaader">
            <i className='fa fa-cog fa-2x moon-gray fr pr1 bg-dark-gray' onClick={() => setShowSettingsPopup(true)}/>
            <div className='flex bg-dark-gray h2'>
                <h3
                    className={getPageClassNames(Pages.index, router, currentTab)}
                    onClick={onPageClick(Pages.index)}
                >
                    Home
                </h3>

                <h3
                    className={getPageClassNames(Pages.trades, router, currentTab)}
                    onClick={onPageClick(Pages.trades)}
                >
                    Trades
                </h3>

                {Object.keys(TABS).map((key: string) => (
                    <h3
                        key={key}
                        className={classnames('pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0', {
                            'bg-dark-gray': TABS[key] !== currentTab,
                            'bg-navy': TABS[key] === currentTab,
                        })}
                        onClick={onPageClick(Pages.index, TABS[key])}
                    >
                        {key}
                    </h3>
                ))}

                <h3
                    className={getPageClassNames(Pages.incomes, router, currentTab)}
                    onClick={onPageClick(Pages.incomes)}
                >
                    Incomes
                </h3>

                <h3
                    className={getPageClassNames(Pages.utility, router, currentTab)}
                    onClick={onPageClick(Pages.utility)}
                >
                    Utility
                </h3>
            </div>

            { showSettingsPopup &&
                <Settings
                    settings={savedData.settings}
                    onSave={save}
                    onClose={() => setShowSettingsPopup(false)}
                />
            }
        </div>
    );
};

export default Header
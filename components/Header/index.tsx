import classnames from 'classnames';
import { Settings } from '@components/Tabs/Settings';
import { useContext, useState } from 'react';
import SavedDataConext from '@contexts/savedData';
import { Pages } from '@types';
import { NextRouter, useRouter } from 'next/router';
import Link from 'next/link';

const getPageClassNames = (page: Pages, router: NextRouter) => classnames(
    'pr2 pl2 ml2 mr2 moon-gray grow mt1 mb0',
    {
        'bg-dark-gray': page !== router.pathname,
        'bg-navy': page === router.pathname,
    }
);

const Header = () => {
    const {savedData, save} = useContext(SavedDataConext);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const router = useRouter();

    return (
        <div className="heaader">
            <i className='fa fa-cog fa-2x moon-gray fr pr1 bg-dark-gray' onClick={() => setShowSettingsPopup(true)}/>
            <div className='flex bg-dark-gray h2'>
                <Link
                    href={Pages.index}
                >
                    <h3
                        className={getPageClassNames(Pages.portfolio, router)}
                    >
                        Home
                    </h3>
                </Link>
                <Link
                    href={Pages.trades}
                >
                    <h3
                        className={getPageClassNames(Pages.trades, router)}
                    >
                        Trades
                    </h3>
                </Link>
                <Link
                    href={Pages.import}
                >
                    <h3
                        className={getPageClassNames(Pages.import, router)}
                    >
                        Import
                    </h3>
                </Link>
                <Link
                    href={Pages.gains}
                >
                    <h3
                        className={getPageClassNames(Pages.gains, router)}
                    >
                        Gains
                    </h3>
                </Link>
                <Link
                    href={Pages.incomes}
                >
                    <h3
                        className={getPageClassNames(Pages.incomes, router)}
                    >
                        Incomes
                    </h3>
                </Link>
                <Link
                    href={Pages.utility}
                >
                    <h3
                        className={getPageClassNames(Pages.utility, router)}
                    >
                        Utility
                    </h3>
                </Link>
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
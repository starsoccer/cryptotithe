import classnames from 'classnames';
import { Settings } from '@components/Tabs/Settings';
import { useContext, useState } from 'react';
import SavedDataConext from '@contexts/savedData';
import { Pages } from '@types';
import { NextRouter, useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '@blueprintjs/core';

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
        <div className="header bg-dark-gray flex justify-between">
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
            <div className="flex grow pr2" onClick={() => setShowSettingsPopup(true)}>
                <h3 className="pr2 moon-gray mt1 mb0">
                    Settings
                </h3>
                <Icon className="pt1 moon-gray" icon="cog" iconSize={20}/>
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
import { Settings } from '@components/Tabs/Settings';
import { useContext, useState } from 'react';
import SavedDataConext from '@contexts/savedData';
import { Pages } from '@types';
import { useRouter } from 'next/router';
import { Icon, Tab, Tabs } from '@blueprintjs/core';

const Header = () => {
    const {savedData, save} = useContext(SavedDataConext);
    const [showSettingsPopup, setShowSettingsPopup] = useState(false);
    const router = useRouter();

    return (
        <div>
            <Tabs
                id="header"
                className="ph2 bg-silver pb1"
                onChange={(newTabID) => router.push(`${newTabID}`)}
                renderActiveTabPanelOnly={true}
            >
                <Tab id={Pages.portfolio} title="Home" className="white"/>
                <Tab id={Pages.trades} title="Trades" />
                <Tab id={Pages.import} title="Import" />
                <Tab id={Pages.gains} title="Gains" />
                <Tab id={Pages.incomes} title="Income" />
                <Tab id={Pages.utility} title="Utility" />
                <Tabs.Expander />
                <div className="flex grow pr2 pb1" onClick={() => setShowSettingsPopup(true)}>
                    <div className="flex flex-column justify-center">
                        <h3 className="pr2 pt0 mb0 mt0">
                            Settings
                        </h3>
                    </div>
                    <div className="flex flex-column justify-center">
                        <Icon className="" icon="cog" iconSize={20}/>
                    </div>
                </div>
            </Tabs>
            { showSettingsPopup &&
                <Settings
                    settings={savedData.settings}
                    onSave={save}
                    onClose={() => setShowSettingsPopup(false)}
                />
            }
        </div>
    );

    return (
        <div className="header bg-dark-gray flex justify-between">



        </div>
    );
};

export default Header
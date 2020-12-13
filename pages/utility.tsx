import {useContext, useState} from 'react';
import CurrencyRename from '@components/Tabs/UtilityTab/Utilities/CurrencyRename';
import DailyBalance from '@components/Tabs/UtilityTab/Utilities/DailyBalance';
import TransactionFee from '@components/Tabs/UtilityTab/Utilities/TransactionFee';
import SavedDataContext from '@contexts/savedData';

export enum Sections {
    DailyBalance = 'Daily Balance',
    CurrencyRename = 'Currency Rename',
    TransactionFee = 'Transaction Fee',
}

const Utility = () => {
    const {savedData, save} = useContext(SavedDataContext);
    const [section, setSection] = useState(Sections.DailyBalance);

    const renderSection = () => {
        switch (section) {
            case Sections.CurrencyRename:
                return <CurrencyRename savedData={savedData} save={save}/>;
            case Sections.TransactionFee:
                return <TransactionFee savedData={savedData} save={save} />;
            case Sections.DailyBalance:
            default:
                return <DailyBalance savedData={savedData}/>;
        }
    }

    return (
        <div className='UtilityTab'>
            <div className='tc center'>
                <h3>Utilities</h3>
                <label>Select Utility</label>
                <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSection(Sections[e.currentTarget.value])}>
                    {Object.keys(Sections).map(
                        (item) => <option key={item} value={item}>{Sections[item]}</option>,
                    )}
                </select>
            </div>
            <hr className='center w-50'/>
            {renderSection()}
        </div>
    );
}

export default Utility;
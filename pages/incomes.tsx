import {useContext, useState} from 'react';
import { IncomesTable } from '@components/IncomesTable';
import getYears from '@utils/getYears';
import getByYear from '../src/processing/getByYear';
import calculateIncomesValue from '../src/processing/CalculateIncomesValue';
import incomesOutput from '../src/output/Incomes';
import Button from '@components/Button';
import SavedDataConext from '@contexts/savedData';
import DownloadContext from '@contexts/download';

const CalculateIncomes = () => {
    const {savedData} = useContext(SavedDataConext);
    const {setDownloadInfo} = useContext(DownloadContext);
    const [year, setYear] = useState(0);

    const years = getYears(savedData.incomes);
    const filteredIncomes = getByYear(savedData.incomes, year);
    const {incomes, totalValue} = calculateIncomesValue(filteredIncomes);

    const onDownloadClick = () => {
        setDownloadInfo({
            data: incomesOutput(incomes),
            fileName: "incomes.csv",
            download: true,
        });
    }

    return (
        <div className="calculate-income">
            <div className="w5 center">
                <h3 className="tc">Calculate Incomes</h3>
                <div className="flex justify-center">
                    <label className="mr2">Year</label>
                    <select
                        onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    >
                        <option value="0">----</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
                {!!totalValue &&
                    <div className="tc">
                        <h4 className="tc">Value: {totalValue}</h4>
                        <Button label="Download" onClick={onDownloadClick} />
                    </div>
                }
            </div>

            {!!year && !!incomes.length &&
                <IncomesTable
                    incomes={incomes}
                    settings={savedData.settings}
                />
            }
        </div>
    );
};

export default CalculateIncomes;
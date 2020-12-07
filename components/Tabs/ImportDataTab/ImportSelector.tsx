import * as React from "react";
import { EXCHANGES, IImport, ImportType, IncomeImportTypes, TransactionImportType } from "../../../src/types";

export interface IImportSelectorProps {
    onSelectChange: (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onInputChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    importDetails: IImport;
}

export const ImportSelector = (props: IImportSelectorProps) => (
    <div className='import-selector center tc mt2'>
        <label htmlFor='type' className='pr2'>Import Type</label>
        <select name='type' id='type' onChange={props.onSelectChange('type')}>
            {Object.keys(ImportType).map((key) =>
                <option key={key} value={ImportType[key]}>{key}</option>,
            )}
        </select>
        <br />
        {{
            [ImportType.TRANSACTION]: (
                <div>
                    <label htmlFor='subtype' className='pr2'>Import SubType</label>
                    <select name='subtype' id='subtype' onChange={props.onSelectChange('subtype')}>
                        {Object.keys(TransactionImportType).map((key) =>
                            <option key={key} value={TransactionImportType[key]}>{key}</option>,
                        )}
                    </select>
                </div>
            ),
            [ImportType.INCOME]: (
                <div>
                    <label htmlFor='currency' className='pr2'>Currency</label>
                    <input
                        name="currency"
                        id="currency"
                        onChange={props.onInputChange('currency')}
                    />
                </div>
            ),
            [ImportType.TRADES]: null,
            }[props.importDetails.type]
        }
        <label htmlFor='location' className='pr2'>Import Location</label>
        <select name='location' id='location' onChange={props.onSelectChange('location')}>
            {
                {
                    [ImportType.TRANSACTION]: (
                        <option key='Binance' value='BINANCE'>Binance</option>
                    ),
                    [ImportType.INCOME]: (
                        <>
                            {Object.keys(IncomeImportTypes).map((key) =>
                                <option key={key} value={IncomeImportTypes[key]}>{key}</option>,
                            )}
                        </>
                    ),
                    [ImportType.TRADES]: (
                        <>
                            <option key='Auto-Detect' value='Auto-Detect'>Auto-Detect</option>
                            {Object.keys(EXCHANGES).map((key) =>
                                <option key={key} value={EXCHANGES[key]}>{key}</option>,
                            )}
                        </>
                    ),
                }[props.importDetails.type]
            }
        </select>
    </div>
);
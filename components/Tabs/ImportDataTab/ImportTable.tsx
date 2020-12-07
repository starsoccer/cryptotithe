import * as React from "react";
import { IImport, IIncome, IIncomeWithDuplicateProbability, ImportType, ISavedData, ITrade, ITradeWithDuplicateProbability, ITradeWithFiatRate, ITransaction, ITransactionWithDuplicateProbability } from "../../../src/types";
import { DuplicateTradesTable } from "../../DuplicateTradesTable";
import { DuplicateIncomesTable } from "../../DuplicateIncomesTable";
import { DuplicateTransactionsTable } from "../../DuplicateTransactionsTable";
import { IncomesTable } from "../../IncomesTable";
import { TradesTable } from "../../TradesTable";
import { TransactionsTable } from "../../TransactionsTable";

export interface IImportTableProps {
    importDetails: IImport;
    duplicateData: ITradeWithDuplicateProbability[] | ITransactionWithDuplicateProbability[] | IIncomeWithDuplicateProbability[];
    processedData: ITrade[] | ITransaction[] | IIncome[];
    duplicateStatusChange: (tradeID: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    savedData: ISavedData;
    saveEditedData: (data: ITrade[] | ITradeWithFiatRate[] | ITransaction[] | IIncome[]) => void;
}

export const ImportTable = (props: IImportTableProps) => (
    <div className="import-table">
        {props.duplicateData && props.duplicateData.length > 0 &&
            {
                [ImportType.TRANSACTION]: (
                    <div>
                        <h3 className='tc'>Duplicate Transactions</h3>
                        <hr className='center w-50' />
                        <DuplicateTransactionsTable
                            transactions={props.duplicateData as ITransactionWithDuplicateProbability[]}
                            duplicateChange={props.duplicateStatusChange}
                        />
                    </div>
                ),
                [ImportType.INCOME]: (
                    <div>
                        <h3 className='tc'>Duplicate Incomes</h3>
                        <hr className='center w-50' />
                        <DuplicateIncomesTable
                            incomes={props.duplicateData as IIncomeWithDuplicateProbability[]}
                            duplicateChange={props.duplicateStatusChange}
                        />
                    </div>
                ),
                [ImportType.TRADES]: (
                    <div>
                        <h3 className='tc'>Duplicate Trades</h3>
                        <hr className='center w-50' />
                        <DuplicateTradesTable
                            trades={props.duplicateData as ITradeWithDuplicateProbability[]}
                            duplicateChange={props.duplicateStatusChange}
                        />
                    </div>
                ),
            }[props.importDetails.type]
        }
        {props.processedData && props.processedData.length > 0 &&
            {
                [ImportType.TRANSACTION]: (
                    <div>
                        <h3 className='tc'>Transactions to Add</h3>
                        <hr className='center w-50' />
                        <TransactionsTable
                            transactions={props.processedData as ITransaction[]}
                            save={props.saveEditedData}
                            settings={props.savedData.settings}
                        />
                    </div>
                ),
                [ImportType.INCOME]: (
                    <div>
                        <h3 className='tc'>Incomes to Add</h3>
                        <hr className='center w-50' />
                        <IncomesTable
                            incomes={props.processedData as IIncome[]}
                            save={props.saveEditedData}
                            settings={props.savedData.settings}
                        />
                    </div>
                ),
                [ImportType.TRADES]: (
                    <div>
                        <h3 className='tc'>Trades to Add</h3>
                        <hr className='center w-50' />
                        <TradesTable
                            trades={props.processedData as ITrade[]}
                            save={props.saveEditedData}
                            settings={props.savedData.settings}
                        />
                    </div>
                ),
            }[props.importDetails.type]
        }
    </div>
);
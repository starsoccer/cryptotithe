import Button from "@components/Button";
import { IIncome } from "@types";
import { useEffect, useState } from "react";
import { createID } from "src/parsers/utils";

export interface IIncomeDetailsProps {
    income?: IIncome;
    onSave: (income: IIncome) => void;
}

export interface IIncomeEdited {
    date: string;
    amount: string;
    currency: string;
    transactionID?: string;
    fee?: string;
}

const onEdit = (
    income: IIncomeEdited,
    key: string,
    setEditedIncome: (income: IIncomeEdited) => void
) => (e: React.ChangeEvent<HTMLInputElement>) => (
    setEditedIncome({
        ...income,
        [key]: e.currentTarget.value,
    })
);

const initalIncome = (income?: IIncome): IIncomeEdited => (
    income ? {
        ...toEditedIncome(income)
    } : {
        amount: '',
        currency: '',
        ID: '',
        date: new Date().toString()
    }
);

const fromIncomeEdited = (income: IIncomeEdited): IIncome => {
    const newIncome: Partial<IIncome> = {
        ...income,
        date: new Date(income.date).getTime(),
        amount: parseFloat(income.amount),
        fee: income.fee ? parseFloat(income.fee) : 0,
    };

    if (!income.fee) {
        delete newIncome.fee;
    }

    newIncome.ID = createID(newIncome);
    return newIncome as IIncome;
}

const toEditedIncome = (income: IIncome): IIncomeEdited => ({
    ...income,
    date: new Date(income.date).toString(),
    amount: income.amount.toString(),
    fee: income.fee?.toString()
});

const IncomeDetails = ({income, onSave}: IIncomeDetailsProps) => {
    const [editedIncome, setEditedIncome] = useState(initalIncome(income));

    return (
        <div className="income-details tc">
            <div className="flex justify-around pv2">
                <div className="w-50 mh2 flex flex-column">
                    <label for="date">
                        Date
                    </label>
                    <input
                        name="date"
                        onChange={onEdit(editedIncome, 'date', setEditedIncome)}
                        value={editedIncome.date}
                    />
                </div>
                <div className="w-50 mh2 flex flex-column">
                    <label for="transactionID">
                        Transaction ID
                    </label>
                    <input
                        name="transactionID"
                        onChange={onEdit(editedIncome, 'transactionID', setEditedIncome)}
                        value={editedIncome.transactionID}
                    />
                </div>
            </div>
            <div className="flex justify-around pv2">
                <div className="w-30 flex flex-column">
                    <label for="amount">
                        Amount
                    </label>
                    <input
                        name="amount"
                        onChange={onEdit(editedIncome, 'amount', setEditedIncome)}
                        value={editedIncome.amount}
                    />
                </div>
                <div className="w-30 flex flex-column">
                    <label for="currency">
                        Currency
                    </label>
                    <input
                        name="currency"
                        onChange={onEdit(editedIncome, 'currency', setEditedIncome)}
                        value={editedIncome.currency}
                    />
                </div>
                <div className="w-30 flex flex-column">
                    <label for="fee">
                        Fee
                    </label>
                    <input
                        name="fee"
                        onChange={onEdit(editedIncome, 'fee', setEditedIncome)}
                        value={editedIncome.fee}
                    />
                </div>
            </div>

            <Button label="Save Income" onClick={() => onSave(fromIncomeEdited(editedIncome))} />
        </div>
    );
};

export default IncomeDetails
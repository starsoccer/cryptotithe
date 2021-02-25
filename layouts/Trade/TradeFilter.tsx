import { Button, FormGroup, HTMLSelect, Intent, Switch } from "@blueprintjs/core";
import { EXCHANGES, ITrade } from "@types";
import { ChangeEvent, useMemo, useState } from "react";

export interface ITradeFilter {
    trades: ITrade[];
    applyFilter: (trades: ITrade[]) => void;
    autoExpand: boolean;
    showAutoExpand: boolean;
    onAutoExpandChange: (autoExpand: boolean) => void;
}

export function getCurrenciesByExchange(trades: ITrade[], exchange?: EXCHANGES | string) {
    const exchangeTrades = (exchange ?
        trades.filter((trade: ITrade) => trade.exchange === exchange) : trades
    );
    const currencies: Set<string> = new Set();
    for (const trade of exchangeTrades) {
        currencies.add(trade.boughtCurrency);
        currencies.add(trade.soldCurrency);
    }

    return Array.from(currencies).sort();
}

export const TradeFilter= ({ trades, applyFilter, autoExpand, showAutoExpand, onAutoExpandChange }: ITradeFilter) => {
    const [selectedExchange, setSelectedExchange] = useState<EXCHANGES | string>();
    const [selectedCurrency, setSelectedCurrency] = useState<string>();
    const exchanges = useMemo(() => getCurrenciesByExchange(trades, selectedExchange), [trades])

    const onReset = () => {
        setSelectedExchange(undefined);
        setSelectedCurrency(undefined);
        onFilter();
    };

    const onFilter = () => applyFilter(trades.filter((trade) => (
        (!selectedExchange || trade.exchange === selectedExchange) &&
        (!selectedCurrency || trade.boughtCurrency === selectedCurrency || trade.soldCurrency === selectedCurrency)
    )));

    return (
        <div>
            <div className="flex justify-around tc">
                <FormGroup
                    labelFor="type"
                    label="Exchange"
                    helperText="Exchange to filter for"
                    intent={Intent.PRIMARY}
                >
                    <HTMLSelect
                        id="type"
                        name="type"
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedExchange(e.currentTarget.value)}
                    >
                        <option />
                        {Object.keys(EXCHANGES).sort().map((key) =>
                            <option key={key} value={EXCHANGES[key]}>{key}</option>,
                        )}
                    </HTMLSelect>
                </FormGroup>
                <FormGroup
                    labelFor="currency"
                    label="Currency"
                    helperText="Currency to filter for"
                    intent={Intent.PRIMARY}
                >
                    <HTMLSelect
                        id="currency"
                        name="currency"
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCurrency(e.currentTarget.value)}
                        value={selectedCurrency}
                    >
                        <option />
                        {exchanges.map(
                            (currency: string) =>
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>,
                        )}
                    </HTMLSelect>
                </FormGroup>
                <FormGroup
                    labelFor="autoExpand"
                    label="Auto-Expand"
                    helperText="Expand timeline items"
                    intent={Intent.PRIMARY}
                    disabled={!showAutoExpand}
                >
                    <Switch
                        disabled={!showAutoExpand}
                        id="autoExpand"
                        checked={autoExpand}
                        onChange={() => onAutoExpandChange(!autoExpand)}
                    />
                </FormGroup>
            </div>
            <div className="flex justify-around">
                <Button
                    className="mt2"
                    onClick={onReset}
                    icon="reset"
                    intent={Intent.DANGER}
                >
                    Reset Filter
                </Button>
                <Button
                    className="mt2"
                    onClick={onFilter}
                    icon="filter"
                    intent={Intent.PRIMARY}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
}
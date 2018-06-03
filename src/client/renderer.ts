import { EXCHANGES, IHoldings, ISavedData, ITradeWithUSDRate } from "../types";

let savedData: ISavedData = {
    trades: [],
    holdings: {},
    savedDate: undefined,
};
try {
    savedData = require("./data.json");
} catch (ex) {
    alert("Welcome First Time User");
}
const trades: ITradeWithUSDRate[] = savedData.trades;
const holdings: IHoldings = savedData.holdings;

function onSubmit(): void {
    const { dialog } = require("electron").remote;
    dialog.showOpenDialog({properties: ["openFile"]}, fileSelected);
}

function fileSelected(filePaths: string[]): void {
    const exchange: keyof typeof EXCHANGES = (document.getElementById("type") as HTMLSelectElement).value as keyof typeof EXCHANGES;
    const processData: Function = require("./src/parsers").processData;
    const processedData: any = processData(exchange, filePaths[0]);
    if (processedData) {
        // do something
    }
}

async function save(): Promise<void> {
    const save: Function = require("./src/save").save;
    try {
        await save(holdings, trades);
    } catch (err) {
        alert(err);
    }
}

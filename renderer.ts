let savedData = {
    trades: [],
    holdings: {},
};
try {
    savedData = require('./data.json');
} catch (ex) {
    alert('Welcome First Time User');
}
const trades = savedData.trades;
const holdings = savedData.holdings;

function onSubmit(e) {
    const { dialog } = require('electron').remote;
    dialog.showOpenDialog({properties: ['openFile']}, fileSelected);
}

function fileSelected (filePaths: string[]) {
    const exchange = (document.getElementById('type') as HTMLSelectElement).value;
    const processData = require('./src/parsers').processData;
    const processedData = processData(exchange, filePaths[0]);
    if (processedData) {
        
    }
}

async function save () {
    const save = require('./src/save').save;
    try {
        await save(holdings, trades);
    } catch (err) {
        alert(err)
    }
}
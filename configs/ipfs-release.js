const fs = require('fs');

const copyFile = async (source, destination) => {
    return await fs.copyFile(source, destination, (err) => {
        if (err) {
            throw err;
        }
    });
}

async function createIPFSFolder () {

    try {
        fs.mkdirSync('./ipfs', { recursive: true })
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }

    copyFile('./bundle.js', './ipfs/bundle.js');
    copyFile('./node_modules/tachyons/css/tachyons.min.css', './ipfs/tachyons.min.css');
    copyFile('./node_modules/font-awesome/css/font-awesome.min.css', './ipfs/font-awesome.min.css'); 
    copyFile('./index.css', './ipfs/index.css'); 

    const indexHTML = `
    <head>
        <meta charset="UTF-8"/>
        <link rel="stylesheet" href="./tachyons.min.css"/>
        <link rel="stylesheet" href="./font-awesome.min.css"/>
        <link rel="stylesheet" href="./index.css"/>
    </head>
    <body class="bg-light-gray">
        <div id="cryptotithe"></div>
        <script>var exports = {};</script>
        <script id="bundle" src='./bundle.js'></script>
    </body>
    `;


    fs.writeFileSync('./ipfs/index.html', indexHTML);
}

createIPFSFolder();
const join = require("path").join;
// modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
    }); // https://electronjs.org/docs/api/frameless-window
    // notifications https://electronjs.org/docs/tutorial/notifications
    // progressbar https://electronjs.org/docs/tutorial/progress-bar
    mainWindow.loadFile("./out/index.html");
    if (!app.isPackaged || process.env.NODE_ENV === "development") {
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
        installExtension(REACT_DEVELOPER_TOOLS)
            .then(() => {
                mainWindow.show();
                mainWindow.webContents.openDevTools();
            })
            .catch((err) => {
                throw err;
            });
    } else {
        mainWindow.once("ready-to-show", () => {
            mainWindow.show();
        });
    }

    // emitted when the window is closed.
    mainWindow.on("closed", () => {
        // dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.webContents.session.on("will-download",
        (_event, item, _webContent) => {
            //const fs = require('fs')
            switch (item.getFilename()) {
                case "data.json":
                    const path = join(__dirname, "./data.json");
                    item.setSavePath(path);
                    break;
            }
    });

    mainWindow.webContents.session.webRequest.onBeforeRequest({urls: ["https://next/*"]}, (details, callback) => {
        const path = require("path");
        console.log("onBeforeRequest details", details);
        const { url } = details;
        const localURL = path.format({
            dir: path.normalize(__dirname),
            base: url.replace("https://next/", "/out/"),
        });

        let test = path.resolve(localURL).replace(/\\/g, "/");

        //B:\Programming\NodeJS\CryptoTithe\_next\static\u8_QorNbm1uGfHpHf15MU\_ssgManifest.js
        //file:///B:/Programming/NodeJS/CryptoTithe/out/index.html
        callback({
            cancel: false,
            redirectURL: "file:///" + test,
        });
    });
}

// this method will be called when Electron has finished
// initialization and is ready to create browser windows.
// some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// quit when all windows are closed.
app.on("window-all-closed", () => {
    // on OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // on OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// in this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

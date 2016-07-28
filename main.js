const {app, BrowserWindow} = require('electron')

let window = null

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit())

app.on('ready', () => {
    let size = require('electron').screen.getPrimaryDisplay().bounds

    window = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
        show: false,
        frame: false,
        transparent: true
    })

    // window.toggleDevTools()

    window.on('closed', () => window = null)
    window.webContents.on('did-finish-load', () => window.show())
    window.webContents.on('will-navigate', e => e.preventDefault())

    window.loadURL('file://' + __dirname + '/browser/index.html')
})

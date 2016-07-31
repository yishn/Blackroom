const {app, dialog, BrowserWindow} = require('electron')

let window, isReady, file

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit())

app.on('ready', () => {
    let size = require('electron').screen.getPrimaryDisplay().bounds

    window = new BrowserWindow({
        title: app.getName(),
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
    window.webContents.on('will-navigate', evt => evt.preventDefault())
    window.webContents.on('did-finish-load', () => window.webContents.send('load-file', file))

    if (!file && process.argv.length >= 2)
        file = process.argv[1]

    window.loadURL('file://' + __dirname + '/browser/index.html')
})

app.on('open-file', (evt, path) => {
    evt.preventDefault()
    file = path
})

process.on('uncaughtException', function(err) {
    dialog.showErrorBox(`${app.getName()} v${app.getVersion()}`, [
        'Something weird happened. ',
        app.getName(),
        ' will shut itself down. ',
        'If possible, please report this on ',
        app.getName() + '’s repository on GitHub.\n\n',
        err.stack
    ].join(''))

    app.quit()
})

const {app, dialog, BrowserWindow} = require('electron')

let window, isReady, file

app.on('window-all-closed', () => app.quit())

app.on('ready', () => {
    let bounds = require('electron').screen.getPrimaryDisplay().workArea

    window = new BrowserWindow({
        title: app.getName(),
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        enableLargerThanScreen: true,
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

process.on('uncaughtException', err => {
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

var app = require('app')
var BrowserWindow = require('browser-window')

var window = null

// Quit when all windows are closed.
app.on('window-all-closed', function() { app.quit() })

app.on('ready', function() {
    window = new BrowserWindow({
        'use-content-size': true,
        'show': false
    })

    // window.toggleDevTools()

    window.on('closed', function() { window = null })
    window.webContents.on('did-finish-load', function() { window.show() })

    window.loadUrl('file://' + __dirname + '/index.html')
})

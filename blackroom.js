var remote = require('remote')
var app = remote.require('app')
var process = remote.require('process')
var dialog = remote.require('dialog')

function loadImage(path) {
    console.log(path)
}

$(window).on('load', function() {
    $('body').addClass('show')

    $(window).on('click', function() {
        $('body').removeClass('show')
        setTimeout(remote.getCurrentWindow().close, 1000)
    })

    loadImage(process.argv[1])
})

if (process.argv.length < 2) {
    dialog.showErrorBox(app.getName(), 'Please run ' + app.getName() + ' by opening an image file.')
    app.quit()
}

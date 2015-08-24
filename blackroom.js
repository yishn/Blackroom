var remote = require('remote')
var app = remote.require('app')
var process = remote.require('process')
var dialog = remote.require('dialog')

function loadImage(path) {
    // First get image size

    var img = $('#test').attr('src', path)
    var screenSize = [$('#overlay').width(), $('#overlay').height()]
    var maxSize = [screenSize[0] * 0.9, screenSize[1] * 0.9]

    img.on('load', function() {
        var size = [img.width(), img.height()]
        var resizedSize = size

        // Calculate resized image size

        if (size[0] > maxSize[0]) {
            var height = maxSize[0] / size[0] * size[1]
            resizedSize = [Math.round(maxSize[0]), Math.round(height)]
        }
        if (size[1] > maxSize[1]) {
            var width = maxSize[1] / size[1] * size[0]
            resizedSize = [Math.round(width), Math.round(maxSize[1])]
        }

        $('#box').addClass('show')
            .children('.inner')
            .css('width', resizedSize[0])
            .css('height', resizedSize[1])

        setTimeout(function() {
            $('#box .inner img').attr('src', path).addClass('show')
        }, 500)
    })
}

function closeBox() {
    $('#overlay').removeClass('show')
    $('#box').removeClass('show')
        .children('.inner')
        .css('width', 50)
        .css('height', 50)
}

$(window).on('load', function() {
    $('#overlay').addClass('show').on('click', function() {
        closeBox()
        setTimeout(remote.getCurrentWindow().close, 1000)
    })

    loadImage(process.argv[1])
})

if (process.argv.length < 2) {
    dialog.showErrorBox(app.getName(), 'Please run ' + app.getName() + ' by opening an image file.')
    app.quit()
}

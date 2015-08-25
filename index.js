var remote = require('remote')
var fs = require('fs')
var path = require('path')
var settings = require('./settings.json')
var app = remote.require('app')
var process = remote.require('process')
var dialog = remote.require('dialog')

var imageList, current

function getCaption() {
    return [$('#box h1').text(), $('#box h1 + p').text()]
}

function setCaption(text, details) {
    $('#box h1').text(text)
    $('#box h1 + p').text(details)
}

function getShowCaption() {
    return $('#box .caption').hasClass('show')
}

function setShowCaption(show) {
    if (show) $('#box .caption').addClass('show')
    else $('#box .caption').removeClass('show')
}

function loadImage(url) {
    // First get image size

    var img = $('#test').attr('src', url)
    var screenSize = [$('#overlay').width(), $('#overlay').height()]
    var maxSize = [screenSize[0] * settings.maxscale, screenSize[1] * settings.maxscale8]

    img.on('load', function() {
        var size = [img.width(), img.height()]
        var resizedSize = size

        setCaption(path.basename(url), size[0] + '×' + size[1])

        // Calculate resized image size

        if (size[0] > maxSize[0]) {
            var height = maxSize[0] / size[0] * size[1]
            resizedSize = [Math.round(maxSize[0]), Math.round(height)]
        }
        if (size[1] > maxSize[1]) {
            var width = maxSize[1] / size[1] * size[0]
            resizedSize = [Math.round(width), Math.round(maxSize[1])]
        }

        var scale = resizedSize[0] / size[0]

        // Animate box and show image

        $('#box').addClass('show')
            .children('.inner')
            .css('width', resizedSize[0])
            .css('height', resizedSize[1])

        setTimeout(function() {
            $('#box .inner img').attr('src', url)
                .css('transform', 'translate(-50%, -50%) scale(' + scale + ')')
                .parent()
                .addClass('show')
        }, 500)
    })
}

function closeBox(callback) {
    $('#box .inner').removeClass('show')

    setTimeout(function() {
        $('#overlay').removeClass('show')
        $('#box').removeClass('show')
            .children('.inner')
            .css('width', 50)
            .css('height', 50)

        setTimeout(callback, 1000)
    }, 500)
}

$(window).on('load', function() {
    $('#overlay').addClass('show').on('click', function() { closeBox(app.quit) })
    $('#box .inner').on('click', function() { setShowCaption(!getShowCaption()) })
    if (settings.showcaption) $('#box .caption').addClass('show')

    var url = process.argv[1]
    var name = path.basename(url)
    var ext = path.extname(url)
    var dir = path.dirname(url)

    try {
        fs.accessSync(url, fs.R_OK)
    } catch(e) {
        dialog.showErrorBox(app.getName(), 'The given file cannot be read.')
        app.quit()
    }

    loadImage(url)
    imageList = fs.readdirSync(dir).filter(function(x) {
        return settings.extensions.indexOf(path.extname(x)) >= 0
    })
    current = imageList.indexOf(name)

    if (current < 0) {
        dialog.showErrorBox(app.getName(), 'The file extension is not supported.')
        app.quit()
    }
})

if (process.argv.length < 2) {
    dialog.showErrorBox(app.getName(), 'Please run ' + app.getName() + ' by opening an image file.')
    app.quit()
}

const {ipcRenderer, remote, shell} = require('electron')
const {app, process, dialog} = remote
const $ = require('sprint-js')
const fs = require('fs')
const path = require('path')
const settings = require('../settings.json')

let imageList, currentImageIndex, busy

function checkForUpdates(callback) {
    let url = `https://github.com/yishn/${app.getName()}/releases/latest`

    // Check internet connection first
    require('dns').lookup('github.com', err => {
        if (err) return callback(err)

        require('https').get(url, response => {
            let content = ''

            response.on('data', chunk => {
                content += chunk
            })

            response.on('end', () => {
                var hasUpdates = content.indexOf('/tag/v' + app.getVersion()) == -1
                callback(null, hasUpdates, url)
            })
        }).on('error', err => callback(err))
    })
}

function getCaption() {
    return [$('#box h1').text(), $('#box h1 + p').text()]
}

function setCaption(text, details) {
    $('#box h1').text(text).attr('title', text)
    $('#box h1 + p').text(details)
}

function getShowCaption() {
    return $('#box .caption').hasClass('show')
}

function setShowCaption(show) {
    $('#box .caption').toggleClass('show', show)
}

function loadImage(index) {
    if (busy) return

    let url = imageList[index]
    $('#box .inner').removeClass('show')
    busy = true

    // First get image size

    let img = $('#test').attr('src', url)
    let screenSize = [$('#overlay').width(), $('#overlay').height()]
    let maxSize = screenSize.map(x => x * settings.maxscale)

    img.on('load', () => {
        let size = [img.width(), img.height()]
        let resizedSize = size

        // Calculate resized image size

        if (resizedSize[0] > maxSize[0]) {
            let height = maxSize[0] / resizedSize[0] * resizedSize[1]
            resizedSize = [Math.round(maxSize[0]), Math.round(height)]
        }

        if (resizedSize[1] > maxSize[1]) {
            let width = maxSize[1] / resizedSize[1] * resizedSize[0]
            resizedSize = [Math.round(width), Math.round(maxSize[1])]
        }

        let scale = resizedSize[0] / size[0]

        // Animate box and show image

        $('#box')
        .addClass('show')
        .children('.inner')
        .css('width', resizedSize[0])
        .css('height', resizedSize[1])

        setTimeout(() => {
            setCaption(path.basename(url), size.join('x'))

            $('#box .inner img')
            .attr('src', url)
            .css('transform', 'translate(-50%, -50%) scale(' + scale + ')')
            .on('load', () => $('#box .inner').addClass('show'))

            busy = false
        }, 500)
    })
}

function closeBox(callback) {
    $('#box .inner').removeClass('show')

    setTimeout(() => {
        $('#overlay').removeClass('show')

        $('#box')
        .removeClass('show')
        .children('.inner')
        .css('width', 50)
        .css('height', 50)

        setTimeout(callback, 1000)
    }, 500)
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % imageList.length
    loadImage(currentImageIndex)
}

function previousImage() {
    currentImageIndex = (currentImageIndex + imageList.length - 1) % imageList.length
    loadImage(currentImageIndex)
}

$(document).ready(() => {
    $('#overlay').addClass('show').on('click', () => closeBox(() => app.quit()))
    $('#box img').on('click', () => setShowCaption(!getShowCaption()))
    if (settings.showcaption) $('#box .caption').addClass('show')

    $('#box .prev').on('click', () => previousImage())
    $('#box .next').on('click', () => nextImage())

    if (settings.checkupdates) {
        setTimeout(() => {
            checkForUpdates((err, hasUpdates, url) => {
                if (err || !hasUpdates) return

                $('#box .update').addClass('show').on('click', () => {
                    closeBox(() => {
                        shell.openExternal(url)
                        app.quit()
                    })
                })
            })
        }, 1)
    }
}).on('keyup', evt => {
    if (evt.keyCode == 37) {
        // Left
        previousImage()
    } else if (evt.keyCode == 39) {
        // Right
        nextImage()
    } else if (evt.keyCode == 38) {
        // Up
        setShowCaption(true)
    } else if (evt.keyCode == 40) {
        // Down
        setShowCaption(false)
    } else if (evt.keyCode == 27) {
        // Escape
        closeBox(() => app.quit())
    }
})

ipcRenderer.on('load-file', (evt, url) => {
    if (!url) {
        dialog.showErrorBox(app.getName(), `Please run ${app.getName()} by opening an image file.`)
        app.quit()
        return
    }

    let name = path.basename(url)
    let dir = path.dirname(url)

    try {
        fs.accessSync(url, fs.R_OK)
    } catch(e) {
        dialog.showErrorBox(app.getName(), 'The given file cannot be read.')
        app.quit()
        return
    }

    extensionSupported = x => settings.extensions.indexOf(path.extname(x).toLowerCase()) >= 0
    imageList = fs.readdirSync(dir).filter(extensionSupported)
    currentImageIndex = imageList.indexOf(name)
    imageList = imageList.map(x => path.join(dir, x))

    if (currentImageIndex < 0) {
        dialog.showErrorBox(app.getName(), 'The file extension is not supported.')
        app.quit()
        return
    }

    remote.getCurrentWindow().show()
    loadImage(currentImageIndex)
})

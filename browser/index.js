const {ipcRenderer, remote} = require('electron')
const {app, process, dialog} = remote
const $ = require('sprint-js')
const fs = require('fs')
const path = require('path')
const settings = require('../settings.json')

let imageList, currentImageIndex, busy

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
    let maxSize = [screenSize[0] * settings.maxscale, screenSize[1] * settings.maxscale]

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
            setCaption(path.basename(url), size[0] + '×' + size[1])

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

ipcRenderer.on('load-file', (evt, url) => {
    if (!url) {
        dialog.showErrorBox(app.getName(), `Please run ${app.getName()} by opening an image file.`)
        app.quit()
        return
    }

    $('#overlay').addClass('show').on('click', () => closeBox(app.quit))
    $('#box .inner img').on('click', () => setShowCaption(!getShowCaption()))
    if (settings.showcaption) $('#box .caption').addClass('show')

    $('#box .prev').on('click', previousImage)
    $('#box .next').on('click', nextImage)

    let name = path.basename(url)
    let dir = path.dirname(url)

    try {
        fs.accessSync(url, fs.R_OK)
    } catch(e) {
        dialog.showErrorBox(app.getName(), 'The given file cannot be read.')
        app.quit()
        return
    }

    imageList = fs.readdirSync(dir)
        .filter(x => settings.extensions.indexOf(path.extname(x).toLowerCase()) >= 0)
    currentImageIndex = imageList.indexOf(name)
    imageList = imageList.map(x => dir + path.sep + x)

    if (currentImageIndex < 0) {
        dialog.showErrorBox(app.getName(), 'The file extension is not supported.')
        app.quit()
        return
    }

    remote.getCurrentWindow().show()
    loadImage(currentImageIndex)
})

$(document).on('keyup', evt => {
    if (evt.keyCode == 37)
        previousImage()
    else if (evt.keyCode == 39)
        nextImage()
    else if (evt.keyCode == 27)
        closeBox(app.quit)
})

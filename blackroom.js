var remote = require('remote')
var app = remote.require('app')

$(window).on('load', function() {
    $('body').addClass('show')

    $(window).on('click', function() {
        $('body').removeClass('show')
        setTimeout(remote.getCurrentWindow().close, 1000)
    })
})

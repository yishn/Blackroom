var remote = require('remote')
var app = remote.require('app')

window.onload = function() {
    window.onclick = function() {
        remote.getCurrentWindow().close()
    }
}

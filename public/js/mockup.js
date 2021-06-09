var canvas = document.getElementById('myCanvas')
canvas.width = canvas.height = 2000
canvas.style.width = canvas.style.height = "2000px"
var context = canvas.getContext('2d')

var sources = {
    image1: '/img/mockup/back.jpg',
    image2: '/img/mockup/img.jpg',
}

loadImages(sources, function (images) {
    context.drawImage(images.image1, 0, 0, 2000, 2000)
    context.drawImage(images.image2, 100, 1000, 1600, 800)
})

function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL()
    link.download = filename
}

document.getElementById('download').addEventListener('click', function () {
    downloadCanvas(this, 'myCanvas', 'test.png')
}, false)

function loadImages(sources, callback) {
    var images = {}
    var loadedImages = 0
    var numImages = 0

    for (var src in sources) {
        numImages++
    }
    for (var src in sources) {
        images[src] = new Image()
        images[src].onload = function () {
            if (++loadedImages >= numImages) {
                callback(images)
            }
        }
        images[src].src = sources[src]
    }
}
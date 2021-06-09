var canvas = document.getElementById('myCanvas')
canvas.width = canvas.height = 1600
canvas.style.width = canvas.style.height = "500px"
var context = canvas.getContext('2d')

var sources = {
    image1: '/img/mockup/back.jpg',
    image2: '/img/mockup/img.jpg',
}

loadImages(sources, function (images) {
    context.drawImage(images.image1, 0, 0, 500, 500)
    context.drawImage(images.image2, 350, 55, 93, 104)

    var scale = 1600 / 500
    context.setTransform(scale,0,0,scale,0,0)
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
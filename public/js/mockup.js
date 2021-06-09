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
var canvas = document.getElementById('myCanvas')
var context = canvas.getContext('2d')

var sources = {
    image1: '/img/mockup/img.jpg',
    image2: '/img/mockup/img2.jpg',
    image3: '/img/mockup/img3.jpg'
}

loadImages(sources, function (images) {
    context.drawImage(images.image1, 100, 30, 200, 137)
    context.drawImage(images.image2, 350, 55, 93, 104)
    context.drawImage(images.image2, 0, 55, 93, 104)
})


function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL()
    link.download = filename
}

document.getElementById('download').addEventListener('click', function () {
    downloadCanvas(this, 'myCanvas', 'test.png')
}, false)
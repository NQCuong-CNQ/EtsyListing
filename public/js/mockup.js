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
    context.drawImage(images.image2, 120, 800, 1600, 800)
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




var dragdrop = {
    init: function (elem) {
        elem.setAttribute('ondrop', 'dragdrop.drop(event)');
        elem.setAttribute('ondragover', 'dragdrop.drag(event)');
    },
    drop: function (e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        runUpload(file);
    },
    drag: function (e) {
        e.preventDefault();
    }
};

function runUpload(file) {
    if (file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/gif' ||
        file.type === 'image/bmp') {
        var reader = new FileReader(),
            image = new Image();
        reader.readAsDataURL(file);
        reader.onload = function (_file) {
            $('imgPrime').el.src = _file.target.result;
            $('imgPrime').el.style.display = 'inline';
        } // END reader.onload()
    } // END test if file.type === image
}

window.onload = function () {
    if (window.FileReader) {
        dragdrop.init($('userActions').el);
        $('fileUpload').onChange(function () { runUpload(this.files[0]); });
    } else {
        var p = document.createElement('p'),
            msg = document.createTextNode('Sorry, your browser does not support FileReader.');
        p.className = 'error';
        p.appendChild(msg);
        $('userActions').el.innerHTML = '';
        $('userActions').el.appendChild(p);
    }
};
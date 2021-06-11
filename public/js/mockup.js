var canvas = document.getElementById('myCanvas')
canvas.width = canvas.height = 2000
canvas.style.width = canvas.style.height = "2000px"
var context = canvas.getContext('2d')

var sources = {
  image1: '/img/mockup/mk1.jpg',
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

$('#download').on('click', function () {
  downloadCanvas(this, 'myCanvas', 'test.png')
})

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

$("input").on('dragenter', function (e) {
  $(".drop").css({
    "border": "4px dashed #09f",
    "background": "rgba(0, 153, 255, .05)"
  })
  $(".cont").css({
    "color": "#09f"
  })
}).on('dragleave dragend mouseout drop', function (e) {
  $(".drop").css({
    "border": "3px dashed #DADFE3",
    "background": "transparent"
  })
  $(".cont").css({
    "color": "#8E99A5"
  })
})

function handleFileSelect(evt) {
  var files = evt.target.files
  for (var i = 0, f; f = files[i]; i++) {
    if (!f.type.match('image.*')) {
      continue
    }
    var reader = new FileReader()
    reader.onload = (function (theFile) {
      return function (e) {
        var span = document.createElement('span')
        span.innerHTML = ['<img class="thumb" src="', e.target.result,
          '" title="', escape(theFile.name), '"/>'].join('')
        document.getElementById('list').insertBefore(span, null)
      }
    })(f)
    reader.readAsDataURL(f)
    // console.log(files[i])
    // console.log(reader)

    context.drawImage(reader.result, 0, 0, 2000, 2000)
  }
}

$('#files').on('change', handleFileSelect)
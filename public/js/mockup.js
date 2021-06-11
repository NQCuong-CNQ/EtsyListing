var context = document.getElementById('myCanvas').getContext('2d')

var sources = [
  '/img/mockup/mk1.jpg',
  '/img/mockup/mk2.jpg',
  '/img/mockup/mk3.jpg',
  '/img/mockup/mk4.jpg',
  '/img/mockup/mk5.jpg',
]

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

    // var reader = new FileReader()
    // reader.onload = (function (theFile) {
    //   return function (e) {
    //     var span = document.createElement('span')
    //     span.innerHTML = ['<img class="thumb" src="', e.target.result,
    //       '" title="', escape(theFile.name), '"/>'].join('')
    //     document.getElementById('list').insertBefore(span, null)
    //   }
    // })(f)
    // reader.readAsDataURL(f)

    var img = new Image
    img.onload = function () {
      for (let j = 0; j < sources.length; j++) {
        loadImages(sources, function (images) {
          context.drawImage(sources[j], 0, 0, 2000, 2000)
          context.drawImage(img, 0, 0, 1000, 1000)
        })
      }
    }
    img.src = URL.createObjectURL(files[i])
  }
}

$('#files').on('change', handleFileSelect)
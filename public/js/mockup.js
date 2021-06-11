

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

// function loadImages(sources, callback) {
//   var images = {}
//   var loadedImages = 0
//   var numImages = 0

//   for (var src in sources) {
//     numImages++
//   }
//   for (var src in sources) {
//     images[src] = new Image()
//     images[src].onload = function () {
//       if (++loadedImages >= numImages) {
//         callback(images)
//       }
//     }
//     images[src].src = sources[src]
//   }
// }

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

async function handleFileSelect(evt) {
  let files = evt.target.files
  let imgBackground
  let img

  for (let i = 0, f; f = files[i]; i++) {
    if (!f.type.match('image.*')) {
      continue
    }

    // let reader = new FileReader()
    // reader.onload = (function (theFile) {
    //   return function (e) {
    //     let span = document.createElement('span')
    //     span.innerHTML = ['<img class="thumb" src="', e.target.result,
    //       '" title="', escape(theFile.name), '"/>'].join('')
    //     document.getElementById('list').insertBefore(span, null)
    //   }
    // })(f)
    // reader.readAsDataURL(f)
    let location = 0

    for (let j = 0; j < sources.length; j++) {

      $('#canvas-container').append(`
        <canvas id="canvas${i + j}"></canvas>
      `)

      var canvas = document.getElementById(`canvas${i + j}`)
      canvas.width = canvas.height = 2000
      // canvas.style.width = canvas.style.height = "300px"
      var context = canvas.getContext('2d')

      imgBackground = new Image
      imgBackground.src = sources[j]
      await imgBackground.decode()
      await context.drawImage(imgBackground, 0, 0, 2000, 2000)

      img = new Image
      img.src = URL.createObjectURL(files[i])
      await img.decode()
      await context.drawImage(img, 0, 0, 1000, 1000)

      location += 2000
    }
  }
}

$('#files').on('change', handleFileSelect)
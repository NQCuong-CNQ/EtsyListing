var count = 0

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
  count = 0
  
  await createCanvas(files)

  // for (let i = 0, f; f = files[i]; i++) {
  //   if (!f.type.match('image.*')) {
  //     continue
  //   }

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
    // 
  // }
}

async function createCanvas(files){
  count++
  let location = 0

  for (let j = 0; j < sources.length; j++) {
    imgBackground = new Image
    imgBackground.src = sources[j]
    await imgBackground.decode()

    $('#canvas-container').append(`
      <canvas id="canvas${count + j}"></canvas>
    `)

    var canvas = document.getElementById(`canvas${count + j}`)
    canvas.width = imgBackground.naturalWidth
    canvas.height = imgBackground.naturalHeight
    canvas.style.height = "300px"
    canvas.style.width = imgBackground.naturalWidth * 300 / imgBackground.naturalHeight
    var context = canvas.getContext('2d')

    await context.drawImage(imgBackground, 0, 0, 2000, 2000)

    img = new Image
    img.src = URL.createObjectURL(files[count])
    await img.decode()
    await context.drawImage(img, 0, 0, 1000, 1000)

    location += 2000
  }

  if(count < files.length){
    createCanvas(files)
  }
}

$('#files').on('change', handleFileSelect)
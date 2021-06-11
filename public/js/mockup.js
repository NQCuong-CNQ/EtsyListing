var count = 0
var idNum = 0

var sources = [
  '/img/mockup/mk1.jpg',
  '/img/mockup/mk2.jpg',
  '/img/mockup/mk3.jpg',
  '/img/mockup/mk4.jpg',
  '/img/mockup/mk5.jpg',
]

var putLocation = {
  mk1: [197, 231, 1758, 1272],
  mk2: [197, 231, 1758, 1272],
  mk3: [197, 231, 1758, 1272],
  mk4: [197, 231, 1758, 1272],
  mk5: [197, 231, 1758, 1272],
}

console.log(putLocation)
console.log(putLocation[`mk${1}`])
console.log(putLocation[`mk${1}`][0])
console.log(putLocation[`mk${1}`]['0'])

function downloadCanvas(link, canvasId, filename) {
  link.href = document.getElementById(canvasId).toDataURL()
  link.download = filename
}

$('#download-all').on('click', function () {
  downloadCanvas(this, 'myCanvas', 'test.png')
})

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
  count = 0
  idNum = 0
  $('#canvas-container').empty()
  await createCanvas(files)
}

async function createCanvas(files) {
  let imgBackground
  let img
  let location = 0
  let canvas
  let context

  for (let j = 0; j < sources.length; j++) {
    imgBackground = new Image
    imgBackground.src = sources[j]
    await imgBackground.decode()

    $('#canvas-container').append(`
      <canvas id="canvas${idNum}"></canvas>
    `)

    canvas = document.getElementById(`canvas${idNum}`)
    canvas.width = imgBackground.naturalWidth
    canvas.height = imgBackground.naturalHeight
    canvas.style.height = "300px"
    canvas.style.width = imgBackground.naturalWidth * 300 / imgBackground.naturalHeight
    context = canvas.getContext('2d')

    await context.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

    img = new Image
    img.src = URL.createObjectURL(files[count])
    await img.decode()
    await context.drawImage(img, putLocation[`mk${j}`][0], putLocation[`mk${j}`][1], putLocation[`mk${j}`][3] - putLocation[`mk${j}`][0], putLocation[`mk${j}`][4] - putLocation[`mk${j}`][1])
    location += canvas.width
    idNum++
  }

  console.log(putLocation)

  if (count < files.length - 1) {
    count++
    await createCanvas(files)
    return
  }
}

$('#files').on('change', handleFileSelect)
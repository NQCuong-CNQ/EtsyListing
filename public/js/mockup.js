var count = 0
var idNum = 0

var srcBackgroundHor = [
  '/img/mockup/mk1.jpg',
  '/img/mockup/mk2.jpg',
]

var putLocationHor = {
  mk1: [197, 231, 1759, 1272],
  mk2: [81, 109, 923, 669],
}

var srcBackgroundVer = [
  '/img/mockup/mk3.jpg',
  '/img/mockup/mk4.jpg',
  '/img/mockup/mk5.jpg',
]

var putLocationVer = {
  mk1: [147, 80, 678, 862],
  mk2: [206, 34, 637, 666],
  mk3: [233, 26, 608, 578],
}

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

  toastr.clear()
  toastr.info('Rendering Mockup...')

  await createCanvas(files)
}

async function createCanvas(files) {
  let imgBackground
  let img
  let canvas
  let context
  let startX = 0
  let startY = 0
  let width = 0
  let height = 0

  img = new Image
  img.src = URL.createObjectURL(files[count])
  await img.decode()

  if (img.naturalWidth > img.naturalHeight) {
    for (let j = 0; j < srcBackgroundHor.length; j++) {
      imgBackground = new Image
      imgBackground.src = srcBackgroundHor[j]
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

      startX = parseInt(putLocationHor[`mk${j + 1}`][0])
      startY = parseInt(putLocationHor[`mk${j + 1}`][1])
      width = parseInt(putLocationHor[`mk${j + 1}`][2] - putLocationHor[`mk${j + 1}`][0])
      height = parseInt(putLocationHor[`mk${j + 1}`][3] - putLocationHor[`mk${j + 1}`][1])

      await context.drawImage(img, startX, startY, width, height)
      idNum++
    }
  } else if (img.naturalWidth < img.naturalHeight) {
    for (let j = 0; j < srcBackgroundVer.length; j++) {
      imgBackground = new Image
      imgBackground.src = srcBackgroundVer[j]
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

      startX = parseInt(putLocationVer[`mk${j + 1}`][0])
      startY = parseInt(putLocationVer[`mk${j + 1}`][1])
      width = parseInt(putLocationVer[`mk${j + 1}`][2] - putLocationVer[`mk${j + 1}`][0])
      height = parseInt(putLocationVer[`mk${j + 1}`][3] - putLocationVer[`mk${j + 1}`][1])

      context.shadowOffsetX = 10;
context.shadowOffsetY = 10;
context.shadowBlur = 10;
context.shadowColor = 'rgba(25, 24, 23, 1)';
      await context.drawImage(img, startX, startY, width, height)
      idNum++
    }
  }

  if (count < files.length - 1) {
    count++
    await createCanvas(files)
    return
  }
  toastr.clear()
  toastr.success('Complete !')
}

$('#files').on('change', handleFileSelect)
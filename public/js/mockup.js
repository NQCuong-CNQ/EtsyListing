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

  $('.select-all-container').css('display', 'flex')
  $('#download-all').css('display', 'block')
}

$('#select-all-cb').on('change', function () {
  console.log($('#select-all-cb').prop("checked"))
  if ($('#select-all-cb').prop("checked")) {
    for (let i = 0; i < idNum; i++) {
      $(`#select-${i}`).prop("checked", true)      
    }
  } else {
    for (let i = 0; i < idNum; i++) {
      $(`#select-${i}`).prop("checked", false)      
    }
  }
})

async function createCanvas(files) {
  let img
  img = new Image
  img.src = URL.createObjectURL(files[count])
  await img.decode()

  if (img.naturalWidth > img.naturalHeight) {
    await drawCanvas(srcBackgroundHor, putLocationHor, img)
  } else if (img.naturalWidth < img.naturalHeight) {
    await drawCanvas(srcBackgroundVer, putLocationVer, img)
  }

  if (count < files.length - 1) {
    count++
    await createCanvas(files)
    return
  }
  toastr.clear()
  toastr.success('Complete!')
}

async function drawCanvas(srcBackground, putLocation, img){
  let imgBackground
  let canvas
  let context
  let startX = 0
  let startY = 0
  let width = 0
  let height = 0

  for (let j = 0; j < srcBackground.length; j++) {
    imgBackground = new Image
    imgBackground.src = srcBackground[j]
    await imgBackground.decode()

    $('#canvas-container').append(`
      <div class='canvas-select-container'>
        <input class="mt-2 ml-2 canvas-select-checkbox" type="checkbox" id="select-${idNum}">
        <canvas id="canvas-${idNum}"></canvas>
      </div>
    `)

    canvas = document.getElementById(`canvas-${idNum}`)
    canvas.width = imgBackground.naturalWidth
    canvas.height = imgBackground.naturalHeight
    canvas.style.height = "300px"
    canvas.style.width = imgBackground.naturalWidth * 300 / imgBackground.naturalHeight
    context = canvas.getContext('2d')

    await context.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

    startX = parseInt(putLocation[`mk${j + 1}`][0])
    startY = parseInt(putLocation[`mk${j + 1}`][1])
    width = parseInt(putLocation[`mk${j + 1}`][2] - putLocation[`mk${j + 1}`][0])
    height = parseInt(putLocation[`mk${j + 1}`][3] - putLocation[`mk${j + 1}`][1])

    // context.shadowOffsetX = 10
    // context.shadowOffsetY = 10
    // context.shadowBlur = 10
    // context.shadowColor = 'rgba(25, 24, 23, 1)'
    await context.drawImage(img, startX, startY, width, height)
    idNum++
  }
}

$('#files').on('change', handleFileSelect)

function downloadCanvas(canvasId, filename) {
  var aLink = document.createElement('a')
  aLink.download = filename
  aLink.href = document.getElementById(canvasId).toDataURL()
  aLink.click()
}

$('#download-all').on('click', function () {
  for (let i = 0; i < idNum; i++) {
    downloadCanvas(`canvas-${i}`, `${i}.jpg`)
  }
})
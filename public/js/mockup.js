var count = 0, idNum = 0, progressVal = 0, progressRange = 0, numImg = 0

var srcBackgroundHor = [
  '/img/mockup/mk1.jpg',
  '/img/mockup/mk2.jpg',
]

var putLocationHor = {
  mk1: [197, 231, 1759, 1272],
  mk2: [81, 109, 923, 668],
}

var srcBackgroundVer = [
  '/img/mockup/mk3.jpg',
  '/img/mockup/mk4.jpg',
  '/img/mockup/mk5.jpg',
]

var putLocationVer = {
  mk1: [147, 80, 678, 862],
  mk2: [206, 34, 637, 666],
  mk3: [233, 26, 607, 577],
}

var cropHor = [17, 275, 890 - 17, 857 - 275]
var cropVer = [92, 12, 819 - 92, 1103 - 12]

$("input").on('dragenter', e => {
  $(".drop").css({
    "border": "4px dashed #09f",
    "background": "rgba(0, 153, 255, .05)"
  })
  $(".cont").css({
    "color": "#09f"
  })
}).on('dragleave dragend mouseout drop', e => {
  $(".drop").css({
    "border": "3px dashed #DADFE3",
    "background": "transparent"
  })
  $(".cont").css({
    "color": "#8E99A5"
  })
})

checkSelectedAction = list => {
  let count = 0
  for (let item of list) {
    if (item) {
      count++
    }
  }

  if (count >= list.length) {
    return 1
  } else if (count == 0) {
    return 0
  } return -1
}

listHorizontal = () => {
  let list = []
  for (let i = 0; i < numImg; i++) {
    list.push($(`#img-direction-${i}`).prop("checked"))
  }
  return list
}

listSelected = () => {
  let list = []
  for (let i = 0; i < idNum; i++) {
    list.push($(`#select-${i}`).prop("checked"))
  }
  return list
}

onCheckCB = id => {
  if ($(`#select-${id}`).prop("checked")) {
    $(`#select-${id}`).prop("checked", false)
  } else {
    $(`#select-${id}`).prop("checked", true)
  }

  if (checkSelectedAction(listSelected()) == 1) {
    $(`#select-all-cb`).prop("checked", true)
  } else {
    $(`#select-all-cb`).prop("checked", false)
  }
}

drawCanvas = async (srcBackground, putLocation, img, crop) => {
  let imgBackground, canvas, context,
    startX = 0, startY = 0, width = 0, height = 0

  for (let j = 0; j < srcBackground.length; j++) {
    imgBackground = new Image
    imgBackground.src = srcBackground[j]
    await imgBackground.decode()

    $('#canvas-container').append(`
      <div class='canvas-select-container'>
        <input class="mt-2 ml-2 canvas-select-checkbox" type="checkbox" id="select-${idNum}">
        <canvas onclick='onCheckCB(${idNum})' id="canvas-${idNum}"></canvas>
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
    await context.drawImage(img, crop[0], crop[1], crop[2], crop[3], startX, startY, width, height)
    idNum++
    progressVal += progressRange
    $('.progress-bar').css('width', `${progressVal}%`)
    $('.progress-bar').text(`${Math.floor(progressVal)}%`)
  }
}

minimizeUpload = () => {
  $('.tit').css('display', 'none')
  $('button.browse').css('display', 'none')
  $('.upload-container').css('height', '100px')
  $('.drop').css('height', '100px')
  $('.drop .cont').css('height', '50px')
}

createCanvas = async (files, listDirect) => {
  let img = new Image
  img.src = URL.createObjectURL(files[count])
  await img.decode()

  minimizeUpload()

  for (let item of listDirect) {
    if (item == 0) {
      await drawCanvas(srcBackgroundVer, putLocationVer, img, cropVer)
    } else if (item == 1) {
      await drawCanvas(srcBackgroundHor, putLocationHor, img, cropHor)
    }
  }

  // if (img.naturalWidth >= img.naturalHeight) {
  //   await drawCanvas(srcBackgroundHor, putLocationHor, img)
  // } else if (img.naturalWidth < img.naturalHeight) {
  //   await drawCanvas(srcBackgroundVer, putLocationVer, img)
  // }

  if (count < files.length - 1) {
    count++
    await createCanvas(files, listDirect)
    return
  }
  toastr.clear()
  toastr.success('Complete!')
}

handleFileSelect = async evt => {
  let files = evt.target.files
  let img, valuemax = 0
  count = 0
  idNum = 0
  progressRange = 0
  progressVal = 0
  $('.progress').css('display', 'block')
  $('.progress-bar').css('width', `0%`)
  $('#canvas-container').empty()
  $('.preview-container').empty()
  $('#render-now-btn').remove()

  numImg = files.length
  for (let i = 0; i < files.length; i++) {
    img = new Image
    img.src = URL.createObjectURL(files[i])
    await img.decode()

    $('.preview-container').append(`
      <div class='preview-block'>
        <img src='${img.src}' height="200px">
        <input class="" type="checkbox" id="img-direction-${i}">
      </div>
    `)

    if (img.naturalWidth > img.naturalHeight) {
      valuemax += srcBackgroundHor.length
    } else if (img.naturalWidth < img.naturalHeight) {
      valuemax += srcBackgroundVer.length
    }
  }

  $('.preview-container').after(`
      <button class="button-primary mb-3" id="render-now-btn">Render Now</button>
    `)

  $('#render-now-btn').on('click', async () => {
    toastr.clear()
    toastr.info('Rendering Mockup...')

    let listDirect = listHorizontal(numImg)
    await createCanvas(files, listDirect)

    $('.select-all-container').css('display', 'flex')
    $('#download-all').css('display', 'block')
    $(`#select-all-cb`).prop("checked", false)
  })

  progressRange = (100 / valuemax)
}

$('#select-all-cb').on('change', () => {
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

$('#files').on('change', handleFileSelect)

downloadCanvas = (canvasId, filename) => {
  let aLink = document.createElement('a')
  aLink.download = filename
  aLink.href = document.getElementById(canvasId).toDataURL()
  aLink.click()
}

$('#download-all').on('click', () => {
  let list = []
  list = listSelected()
  if (checkSelectedAction(list) == 0) {
    toastr.clear()
    toastr.error('Nothing is selected')
    return
  }

  for (let j = 0; j < list.length; j++) {
    if (list[j]) {
      downloadCanvas(`canvas-${j}`, `${j}.jpg`)
    }
  }
})
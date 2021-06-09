window.onload = function() {
    var img1 = new Image()
    img1.src = "/img/mockup/img.jpg"
    var img2 = new Image()
    img2.src = "/img/mockup/img2.jpg"
    var img3 = new Image()
    img3.src = "/img/mockup/img3.jpg"

    var c = document.getElementById("myCanvas")
    var ctx = c.getContext("2d")
    ctx.globalCompositeOperation="destination-over"
    // var img = document.getElementById("scream")
    
    ctx.drawImage(img1, 0, 100, 100, 100)
    ctx.drawImage(img2, 100, 100, 100, 100)
    ctx.drawImage(img3, 200, 100, 100, 100)
  }
  
  function downloadCanvas(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL()
      link.download = filename
  }
  
  document.getElementById('download').addEventListener('click', function() {
      downloadCanvas(this, 'myCanvas', 'test.png')
  }, false)
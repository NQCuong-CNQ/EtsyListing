window.onload = function() {
    var c = document.getElementById("myCanvas")
    var ctx = c.getContext("2d")
    var img = document.getElementById("scream")
    ctx.globalCompositeOperation="destination-over"
    ctx.drawImage(img, 10, 10)
  }
  
  function downloadCanvas(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL()
      link.download = filename
  }
  
  document.getElementById('download').addEventListener('click', function() {
      downloadCanvas(this, 'myCanvas', 'test.png')
  }, false)
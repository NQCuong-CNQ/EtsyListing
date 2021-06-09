window.onload = function() {
    var c = document.getElementById("myCanvas")
    var ctx = c.getContext("2d")
    ctx.globalCompositeOperation="destination-over"
    var img = document.getElementById("scream")
    
    ctx.drawImage(img, 100, 100, 100, 100)
  }
  
  function downloadCanvas(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL()
      link.download = filename
  }
  
  document.getElementById('download').addEventListener('click', function() {
      downloadCanvas(this, 'myCanvas', 'test.png')
  }, false)
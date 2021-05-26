// var express = require("express")
// var app = express()
// const http = require("http")

// var app = express();
// var server = http.createServer(app);
// var io = require("socket.io")(server, {
//   cors: {
//     origin: '*',
//   }
// })

// let dataSocket = []
// let dataD
// io.on('connect', function (socket) {
//   socket.on('userConnected', socket.join);
//   socket.on('userDisconnected', socket.leave);

//   socket.on('step1', function (data) {
//     dataD = new Object
//     dataD['name'] = data
//     dataD['id'] = socket.id
//     dataSocket.push(dataD)
//     console.log(dataSocket)
//   });

  
// });


// server.listen(8080)
getEpochTime()
function getEpochTime() {
    var date = new Date(0)
    date.setUTCSeconds(1621997752)
    time = String(date)
    time = time.split(' ')
    time = time[4] + ' ' + time[2] +'/'+convertMonthInString(time[1])
    console.log(time)
  }

  function convertMonthInString(month) {
    switch (month) {
      case 'Jan': return '01'
      case 'Feb': return '02'
      case 'Mar': return '03'
      case 'Apr': return '04'
      case 'May': return '05'
      case 'Jun': return '06'
      case 'Jul': return '07'
      case 'Aug': return '08'
      case 'Sep': return '09'
      case 'Oct': return '10'
      case 'Nov': return '11'
      case 'Dec': return '12'
    }
  }
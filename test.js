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
let date = new Date().getTime() / 1000
console.log(date - 1620908495 + '/' + 86400 * 30)
console.log(60*60*24)


 date = new Date(0)
date.setUTCSeconds(1313337709)
time = String(date)
console.log(time)
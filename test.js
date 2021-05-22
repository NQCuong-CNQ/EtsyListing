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

let str = 'sdfsda'
str = str.split('')
console.log(str.length)
for(let i = 0; i<str.length; i++){
  console.log(str[i])
}

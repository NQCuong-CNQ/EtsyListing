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
const MongoClient = require('mongodb').MongoClient;
let clientDBBraumstar =  MongoClient.connect('mongodb://zic:Mynewpassword%400@braumstar.com:27020/zicDb?authSource=zicDb', { useNewUrlParser: true, useUnifiedTopology: true })
    var dboBraumstar = clientDBBraumstar.db("zicDb")

    var data = {
      _id: null,
      username: 'ae11',
      password: 'aeviking',
      createdAt: Date.now() / 1000 | 0,
      updatedAr: Date.now() / 1000 | 0
    }


       dboBraumstar.collection("users").insertOne(data)
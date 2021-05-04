"use strict";
const fs = require('fs')
var express = require("express")
var app = express()

var server = require("https").createServer(app)


// app.use(function cors(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   next()
// })

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html")
});

app.use(express.static("public"))


server.listen(80)

require("greenlock-express")
  .init({
    packageRoot: __dirname,
    configDir: "./greenlock.d",
    maintainerEmail: "jon@example.com",
    cluster: false,
    approveDomains: ['giftsvk.com', 'www.giftsvk.com', 'localhost'],
  })
  .serve(app)
  .ready(httpsWorker)

  
function httpsWorker(glx) {
  var socketio = require("socket.io")
  var io;

  // we need the raw https server
  var server = glx.httpsServer();

  io = socketio(server);

  io.on("connection", function (client) {
    console.log("Client connected...")
  
    client.on("join", function (data) {
      console.log(data.customId)
    });
  
    client.on("messages", function (data) {
      console.log(data)
      //   client.emit("thread", data);
      client.broadcast.emit("thread", data)
    });
  });
}
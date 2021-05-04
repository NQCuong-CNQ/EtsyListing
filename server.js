"use strict";
const fs = require('fs')
var express = require("express")
var app = express()

var server = require("https").createServer(app)
var io = require("socket.io")(server)

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

// io.on("connection", function (client) {
//   console.log("Client connected...")

//   client.on("join", function (data) {
//     console.log(data.customId)
//   });

//   client.on("messages", function (data) {
//     console.log(data)
//     //   client.emit("thread", data);
//     client.broadcast.emit("thread", data)
//   });
// });
// server.listen(80)

require("greenlock-express")
  .init({
    packageRoot: __dirname,
    configDir: "./greenlock.d",
    maintainerEmail: "jon@example.com",
    cluster: false,
    approveDomains: ['giftsvk.com', 'www.giftsvk.com', 'localhost'],
  })
  .serve(app)

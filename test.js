var express = require("express")
var app = express()
const http = require("http")

var server = http.createServer(app)
  
var io = require('socket.io-client')
var socket = io.connect("https://giftsvk.com", {
    port: 443,
    reconnect: true
})

socket.on("test", async function (data) {
    console.log(data)
  })

server.listen(5555)
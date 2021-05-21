var express = require("express")
var app = express()
const http = require("http")

var server = http.createServer(app)
  
var io = require("socket.io")
var socket = io.connect("https://giftsvk.com:443")
socket.on("test", async function () {
    console.log('test')
  })

server.listen(5555)
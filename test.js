var express = require("express")
var app = express()
const http = require("http")

var server = http.createServer(app)
  
var io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
  })

  server.listen(555)
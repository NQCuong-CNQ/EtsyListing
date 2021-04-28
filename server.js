"use strict";
var express = require("express");
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "giftsvk.com"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// require("greenlock-express")
//   .init({
//     packageRoot: __dirname,
//     configDir: "./greenlock.d",
//     maintainerEmail: "jon@example.com",
//     cluster: false
//   })
//   .serve(app);

var server = require("https").createServer(app);
var io = require("socket.io")(server);

app.get("/", function (req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static("public"));

io.on("connection", function (client) {
  console.log("Client connected...");

  client.on("join", function (data) {
    console.log(data.customId);
  });

  client.on("messages", function (data) {
    console.log(data)
    //   client.emit("thread", data);
    client.broadcast.emit("thread", data);
  });
});
server.listen(80);
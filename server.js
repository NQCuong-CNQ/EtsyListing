"use strict";
var express = require("express");
var app = express();
var server = require("https").createServer(app);


require("greenlock-express")
  .init({
    packageRoot: __dirname,
    configDir: "./greenlock.d",
    maintainerEmail: "jon@example.com",
    cluster: false
  })
  .serve(server);

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
server.listen(80, '154.27.90.80');
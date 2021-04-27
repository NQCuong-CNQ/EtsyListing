"use strict";
var express = require("express");
var app = express();
var server = require("https").createServer(app);
var io = require("socket.io")(server);


require("greenlock-express")
  .init({
    packageRoot: __dirname,

    // contact for security and critical bug notices
    configDir: "./greenlock.d",
    maintainerEmail: "jon@example.com",
    // whether or not to run at cloudscale
    cluster: false
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(app);


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
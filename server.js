const express = require("express");
const app = express();

let broadcaster;
let mainRoom = "";
const port = 8080;
const fs = require('fs');
const https = require("https");
const http = require("http");

var privateKey = fs.readFileSync("sslcert/learnomaprivate.key", "utf8");
var certificate = fs.readFileSync("sslcert/learnomacertificate.crt", "utf8");

var credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app);
// const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));

// all server sockets will be used for api too

io.sockets.on("connection", socket => {

  socket.on("broadcaster", (roomName) => {
    broadcaster = socket.id;
    mainRoom = roomName;
    console.log("main room is ", mainRoom);
    socket.join(mainRoom);
    socket.broadcast.to(mainRoom).emit("broadcaster");
  });

  socket.on("watcher", (room) => {
    socket.join(room);
    socket.to(room).emit("watcher", socket.id);
  });

  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });

  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });

  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });

  socket.on("disconnect", () => {
    socket.to(socket.id).emit("disconnectPeer", socket.id);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
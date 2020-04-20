const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const path = require("path");

function getRandmNumber() {
  return Math.ceil(Math.random() * 1000);
}

const offerMap = {};

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

const server = http.createServer(app);

server.listen(4000, () => {
  console.log("saerver on 4000");
});

const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("new client connected");

  socket.on("offer", function (data) {
    console.log("offer", data);
    const number = getRandmNumber();
    offerMap[number] = data;
    socket.emit("offer-reply", number);
  });

  socket.on("start-call", function (data) {
    console.log(offerMap);
    console.log("offer le");
    socket.emit("le-offer", offerMap[data]);
  });

  socket.on("answer", function (data) {
    console.log("answer", data);
    socket.broadcast.emit("answer", data);
  });

  socket.on("candidate", function (data) {
    console.log("icecandidate", data);
    socket.broadcast.emit("candidate-reply", data);
  });
});

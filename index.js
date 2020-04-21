const express = require("express");
const socketIo = require("socket.io");
const path = require("path");
var http = require("http");

function getRandmNumber() {
  return Math.ceil(Math.random() * 1000);
}

const offerMap = {};

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

var httpsServer = http.createServer(app);
httpsServer.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log("saerver on 4000");
});

const io = socketIo(httpsServer);

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
    socket.broadcast.emit("answer-reply", data);
  });

  socket.on("candidate", function (data) {
    console.log("icecandidate", data);
    socket.broadcast.emit("candidate-reply", data);
  });
});

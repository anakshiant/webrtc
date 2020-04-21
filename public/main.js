let socket = io.connect();
let callButton = document.getElementById("call");
let localVideo = document.getElementById("localStream");
let recievedVide = document.getElementById("recievedStream");
let join = document.getElementById("join");
let number = document.getElementById("number");
let myPeerConnection = null;

let localStream = null;

callButton.addEventListener("click", openCamera);

join.addEventListener("click", function () {
  socket.emit("start-call", number.value);
});

socket.on("offer-reply", handleOffer);
socket.on("candidate-reply", handleNewICECandidateMsg);
socket.on("le-offer", handleVideoOfferMsg);
socket.on("answer-reply", handleAnswer);

function createPeerConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.ontrack = handleTrackEvent;
  myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
}

async function openCamera() {
  if (!myPeerConnection) {
    createPeerConnection();
  }
  localStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
  localVideo.srcObject = localStream;

  localStream.getTracks().forEach((track) => {
    console.log(track);
    myPeerConnection.addTrack(track, localStream);
  });
}

function handleTrackEvent(event) {
  console.log("track revieving", event);
  recievedVide.srcObject = event.streams[0];
}

function handleNegotiationNeededEvent() {
  console.log("creating offer");
  myPeerConnection
    .createOffer()
    .then(function (offer) {
      console.log("setting local dsp on", myPeerConnection, offer);
      return myPeerConnection.setLocalDescription(offer);
    })
    .then(function () {
      socket.emit("offer", myPeerConnection.localDescription);
    })
    .catch(alert);
}

function handleOffer(msg) {
  document.getElementById("meet").innerHTML = msg;
}

function handleAnswer(answer) {
  var desc = new RTCSessionDescription(answer);

  myPeerConnection.setRemoteDescription(desc);
}

function handleVideoOfferMsg(offer) {
  console.log(offer);
  console.log("offer reached");
  var localStream = null;
  createPeerConnection();

  var desc = new RTCSessionDescription(offer);

  myPeerConnection
    .setRemoteDescription(desc)
    .then(function () {
      return navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    })
    .then(function (stream) {
      localStream = stream;
      localVideo.srcObject = localStream;

      localStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, localStream));
    })
    .then(function () {
      return myPeerConnection.createAnswer();
    })
    .then(function (answer) {
      return myPeerConnection.setLocalDescription(answer);
    })
    .then(function () {
      socket.emit("answer", myPeerConnection.localDescription);
    })
    .catch(console.log);
}

function handleICECandidateEvent(event) {
  console.log("candidate event");
  if (event.candidate) {
    socket.emit("candidate", event.candidate);
  }
}

function handleNewICECandidateMsg(msg) {
  console.log(msg);
  console.log("candidiate reached");
  try {
    var candidate = new RTCIceCandidate(msg);
  } catch (err) {
    console.log("err", err);
  }

  if (myPeerConnection) {
    myPeerConnection.addIceCandidate(candidate).catch(console.error);
  }
}

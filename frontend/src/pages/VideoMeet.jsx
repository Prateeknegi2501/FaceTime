import React, { useEffect, useRef, useState } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import { io } from "socket.io-client";
import styles from "../VideoMeet.module.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";

const serverURL = "http://localhost:8000";
var connections = {};
const iceCandidateQueue = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
//Stun server are lightweight server running on public internet and return Ip address of requester's device
export default function VideoMeet() {
  var socketRef = useRef();
  var socketIdRef = useRef();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(false); //video controls
  let [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [newMessages, setNewMessages] = useState(0); //pop up for new message
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      // Checking both video and audio permissions in a single call
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true, // Check if video is available
        audio: true, // Check if audio is available
      });

      // If permissions are granted, set the states accordingly
      setVideoAvailable(true); // Camera is available
      setAudioAvailable(true); // Microphone is available

      // Check if screen sharing is available
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      // Assign the userMediaStream to the local stream if available
      if (userMediaStream) {
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (e) {
      console.log("Error accessing media devices: ", e);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }
    window.localStream = stream; //store video in window object
    localVideoRef.current.srcObject = stream; //user can see its own video

    for (let id in connections) {
      if (id == socketIdRef.current) continue;

      // connections[id].addStream(window.localStream); older way

      window.localStream.getTracks().forEach((track) => {
        //Can Control track independently
        connections[id].addTrack(track, window.localStream);
      });
      /*WebRTC itself doesn’t handle signaling.
      So we have to
      * You create an offer (createOffer()).
      * You set it as your local description (setLocalDescription()).
      * Then you emit it to the other user via socket (socket.emit()).*/

      connections[id].onnegotiationneeded = async () => {
        try {
          const offer = await connections[id].createOffer();
          await connections[id].setLocalDescription(offer);
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription })
          );
        } catch (err) {
          console.error("Negotiation error:", err);
        }
      };
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }

          //Black Silence
          let blackslience = (...args) =>
            new MediaStream([black(...args), silence(...args)]);
          window.localStream = blackslience();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].onnegotiationneeded = async () => {
              try {
                const offer = await connections[id].createOffer();
                await connections[id].setLocalDescription(offer);
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              } catch (err) {
                console.error("Negotiation error:", err);
              }
            };
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => {
          getUserMediaSuccess(stream);
        })
        .catch((e) => {
          console.log("Availablity error: ", e); //User denies Permisionor other errors
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log("TrackError :", e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio != undefined) {
      getUserMedia();
    }
  }, [audio, video]);
  //gotMessageFromServer

  const iceCandidateQueue = {};

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    const pc = connections[fromId];
    if (!pc) return;

    if (signal.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            return pc.createAnswer().then((desc) => {
              return pc.setLocalDescription(desc).then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: pc.localDescription })
                );
              });
            });
          }
        })
        .then(() => {
          // Process any queued ICE candidates
          if (iceCandidateQueue[fromId]) {
            iceCandidateQueue[fromId].forEach((candidate) => {
              pc.addIceCandidate(candidate).catch(console.error);
            });
            delete iceCandidateQueue[fromId];
          }
        })
        .catch(console.error);
    } else if (signal.ice) {
      const candidate = new RTCIceCandidate(signal.ice);
      if (pc.remoteDescription && pc.remoteDescription.type) {
        pc.addIceCandidate(candidate).catch(console.error);
      } else {
        if (!iceCandidateQueue[fromId]) {
          iceCandidateQueue[fromId] = [];
        }
        iceCandidateQueue[fromId].push(candidate);
      }
    }
  };

  //AddMessage
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(serverURL, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-messages", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExist = videoRef.current.find(
              (video) => video.socketId === socketListId
            );
            if (videoExist) {
              console.log("FOUND EXISTING");
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            //todo blackslience
            let blackslience = (...args) =>
              new MediaStream([black(...args), silence(...args)]);
            window.localStream = blackslience();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (error) {
              console.log("Adding stream error : ", error);
            }
            connections[id2].onnegotiationneeded = async () => {
              try {
                const offer = await connections[id2].createOffer();
                await connections[id2].setLocalDescription(offer);
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              } catch (err) {
                console.error("Negotiation error:", err);
              }
            };
          }
        }
      });
    });
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].onnegotiationneeded = async () => {
        try {
          const offer = await connections[id].createOffer();
          await connections[id].setLocalDescription(offer);
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription })
          );
        } catch (err) {
          console.error("Negotiation error:", err);
        }
      };
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }

          //Black Silence
          let blackslience = (...args) =>
            new MediaStream([black(...args), silence(...args)]);
          window.localStream = blackslience();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then((stream) => {
            getDisplayMediaSuccess(stream);
          })
          .catch((e) => console.log("Display media error" + e));
      }
    }
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };
  let handleAudio = () => {
    setAudio(!audio);
  };
  let handleChat = () => {
    setNewMessages(0);
    setShowModal(!showModal);
  };
  useEffect(() => {
    if (screen != undefined) {
      getDisplayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  const navigate = useNavigate();
  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    addMessage(message, username, socketIdRef.current);
    setMessage("");
  };

  const handleEndCall = () => {
    try {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      navigate("/home");
    } catch (error) {
      navigate("/");
    }
  };

  const getGridStyle = () => {
    const count = videos.length + 1 || 1;
    let bestCols = 1;
    let bestRows = 1;

    // Adjust width based on whether chat is open
    const chatBoxWidth = showModal ? window.innerWidth * 0.3 : 0; // Approx 30% width if open
    const containerWidth = window.innerWidth - chatBoxWidth;
    const containerHeight = window.innerHeight;

    let maxVideoSize = 0;

    for (let cols = 1; cols <= count; cols++) {
      const rows = Math.ceil(count / cols);
      const videoWidth = containerWidth / cols;
      const videoHeight = containerHeight / rows;

      const adjustedHeight = (videoWidth * 9) / 16;
      const size = Math.min(videoHeight, adjustedHeight);

      if (size > maxVideoSize) {
        maxVideoSize = size;
        bestCols = cols;
        bestRows = rows;
      }
    }

    return {
      display: "grid",
      gridTemplateColumns: `repeat(${bestCols}, 1fr)`,
      gridTemplateRows: `repeat(${bestRows}, 1fr)`,
      width: `calc(100% - ${showModal ? "30vw" : "0"})`,
      height: "100%",
      gap: "8px",
      padding: "8px",
      boxSizing: "border-box",
      overflow: "hidden",
      transition: "width 0.3s ease-in-out",
    };
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyContainer}>
          <h2>Enter into Lobby</h2>
          <div className={styles.panel}>
            <TextField
              id="outlined-error"
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.usernameInput}
            />
            <Button
              variant="contained"
              onClick={connect}
              className={styles.connectButton}
            >
              Connect
            </Button>
          </div>
          <div className={styles.preview}>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.btnContainer}>
            <div className={styles.btns}>
              <IconButton style={{ color: "white" }} onClick={handleVideo}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton style={{ color: "white" }} onClick={handleAudio}>
                {audio === true ? <MicNoneIcon /> : <MicOffIcon />}
              </IconButton>
              {screenAvailable === true ? (
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen === true ? (
                    <StopScreenShareIcon />
                  ) : (
                    <ScreenShareIcon />
                  )}
                </IconButton>
              ) : (
                ""
              )}

              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton onClick={handleChat} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
            </div>
          </div>

          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>chat</h1>
                <div className={styles.displayChat}>
                  {messages.length > 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div
                          style={{ textAlign: "left", marginBottom: "5px" }}
                          key={index}
                        >
                          <p style={{ fontWeight: "bolder" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>Start Conversation</p>
                  )}
                </div>
                <div className={styles.chatArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Type a Message"
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={sendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div style={getGridStyle()}>
            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              muted
            ></video>
            {videos.map((video) => (
              <div
                key={video.socketId}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  backgroundColor: "#000",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <video
                  data-socket={video.socketId}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={false}
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

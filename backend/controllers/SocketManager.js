import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("something is connected");
    
    socket.on("join-call", (path) => {
      //Check path is defined or not if not create a connection then push the user into that path also add timeOnline
      //Send users a message to inform new user connected
      //
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-messages",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      //toID whome we have to send
      //socket.id  who send the message
      io.to(toId).emit("signal", socket.id, message); // to send message to particular client whose id is toId
    });

    socket.on("chat-message", (data, sender) => {
      // Find the room this socket belongs to
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
      }

      connections[matchingRoom].forEach((socketID) => {
        socket.to(socketID).emit("chat-messages", data, sender, socket.id);
      });
      /*
      let matchingRoom=null;
      for(const [room,users]=Object.entries(connection)){
        if(users.includes(socket.id)){
          matchingRoom=room;
          break;
        }
      }
      
      if(matchingRoom){
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
      }

      connections[matchingRoom].forEach((socketID) => {
        socket.to(socketID).emit("chat-messages", data, sender, socket.id);
      });
      
      */
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());
      console.log(`Socket ${socket.id} was online for ${diffTime} ms`);
      for (const [roomName, socketList] of Object.entries(connections)) {
        const index = socketList.indexOf(socket.id);
        if (index != -1) {
          // Notify others in the room
          socketList.forEach((id) => {
            if (id != socket.id) {
              io.to(id).emit("user-left", socket.id);
            }
          });

          socketList.splice(index, 1);

          if (socketList.length === 0) {
            delete connections[roomName];
          }
          break;
        }
      }
    });
  });

  return io;
};

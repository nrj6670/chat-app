const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

//setting up dynamic port
const port = process.env.PORT || 3000;

const app = express();

//creating server to pass to send it to socket io as input. *** Server is automatically
//created if not created manually
const server = http.createServer(app);
const io = socketio(server);

//setting up static resource
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

//configuring index.js to work with client that connects to it

//let count = 0; //count example

io.on("connection", (socket) => {
  console.log("New WebSocket Connection");

  //joining a new room
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    //Sending welcome message on a new connection
    socket.emit("message", generateMessage("admin", "Welcome!!"));

    //Sending message to connected client when a new client joins
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("admin", `${user.username} has joined!!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  //Count update on all the connected clients whenever the count is updated
  //socket.emit("countUpdated", count);
  // socket.on("increment", () => {
  //   count++;
  //   io.emit("countUpdated", count);
  // });

  //receiving message from one connected client and sending to everyone connected
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!!");
    }

    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage(user.username, message));
      callback();
    }
  });

  //receiving location from one client and send it to others
  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${position.latitude},${position.longitude}`
        )
      );
      callback();
    }
  });

  //sends a message to all connected clients when a client is disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

//Listening upcoming request in port
server.listen(port, () => {
  console.log(`Server is up and running in port ${port}`);
});

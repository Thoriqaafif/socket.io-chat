const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = [];
let rooms = [];
let numusers = 0;

app.use(express.static(join(__dirname, "public/chat")));

app.use('/login', express.static(join(__dirname, "public/login")));

io.use((socket, next) => {
  // Middleware function
  // console.log('Middleware running');
  // const err = new Error('Not Authorized');
  // next(err); 
  // users.push({
  //   'name': "...", 
  //   'token': socket.handshake.auth.token,
  // })
  // socket.username = "afif"
  const token = socket.handshake.auth.token;
  // if (token == undefined) {
  //   console.log("Token isn't available");
  // } else {
  //   console.log("Token: " + token);
  // }
  next();
});

io.on('connection', (socket) => {
  let addedUser = false;

  socket.on("new user", (data) => {
    if (addedUser) return;

    // add username to socket session
    socket.username = data.username;
    numusers +=1;
    addedUser = true;

    // add to user list
    users.push({"username": data.username});
    socket.broadcast.emit("new user", {"username": data.username});
  });

  socket.on('chat message', (data) => {
    chatData = {
      "sender": data.sender,
      "message": data.message,
    }
    if (data.room === "") {
      socket.broadcast.emit('new message', chatData);
    }
    else {
      socket.to(data.room).emit("new message", chatData);
    }
  });

  socket.on("join room", (data) => {
    socket.join(data.room);
    console.log(socket.rooms);
  })

  socket.on("disconnect", () => {
    if(addedUser) {
      numusers -=1;

      // broadcast the leave connection information
      socket.broadcast.emit("user leave", {
        "username": socket.username 
      })
    }
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
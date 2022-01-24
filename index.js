const express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

const { getPathRoadsAPI } = require('./utils/roadsAPI/getPathRoadsAPI');

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET"]
  }
});;

const PORT = 3001;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  const pathHistory = [];

  socket.on('disconnect', () => {
    console.log('\nuser disconnected', chalk.red(socket.id), '\n');
  });

  socket.on('lobby', (clientObj) => {
    console.log(`new looby join: ${chalk.green(socket.id)} (${chalk.blue(clientObj.type)})`);

    if (clientObj.type === 'sender') {
      const roomId = `${clientObj.socketId}@${uuidv4()}`;

      clientObj['roomId'] = roomId;

      socket.join(roomId);

      io.to(clientObj.socketId).emit('roomId', clientObj);
    } else if (clientObj.type === 'receiver') {
      if (io.sockets.adapter.rooms.get(clientObj.roomId) !== undefined) {
        socket.join(clientObj.roomId);
      } else {
        // No room for that id
      }
    }
  });

  const COUNTER = (function() {
    let number = 0;

    return function() {
      number++;

      return number;
    }
  })();

  socket.on('toRoadsAPI', async (clientObj) => {
    clientObj['index'] = COUNTER();
    console.log(clientObj);

    pathHistory.push(clientObj)

    if (pathHistory.length < 2) return;

    // send to roadsAPI
    const l = pathHistory.length;
    const firstPath = pathHistory[l - 2];
    const secondPath = pathHistory[l - 1];

    let myPath = `${firstPath.lat}%2C${firstPath.lng}|`
    myPath += `${secondPath.lat}%2C${secondPath.lng}`

    const roadsResponse = await getPathRoadsAPI(myPath)

    // sends the response to sender an reciver
    io.to(clientObj.roomId).emit('fromRoadsAPI', roadsResponse.data);
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

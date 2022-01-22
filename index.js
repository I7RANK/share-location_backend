const express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET"]
  }
});;

const PORT = 3001;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  const path = [];

  socket.on('test-location', (client) => {
    path.push({lat: client.lat, lng: client.lng});
  });

  socket.on('disconnect', () => {
    console.log('\nuser disconnected', chalk.red(socket.id), '\n');

    let rawdata = fs.readFileSync('bike_tracking.json');
    let trackingHistory = JSON.parse(rawdata);

    trackingHistory.push(path);

    let data = JSON.stringify(trackingHistory);
    fs.writeFileSync('bike_tracking.json', data);
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

  socket.on('toRoadsAPI', (clientObj) => {
    clientObj['index'] = COUNTER();
    console.log(clientObj);
    // send to roadsAPI
    // sends the response to sender an reciver
    io.to(clientObj.roomId).emit('fromRoadsAPI', clientObj);
  })
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

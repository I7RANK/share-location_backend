const express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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
  console.log('a user connected', socket.id);

  const path = [];

  socket.on('test-location', (client) => {
    path.push({lat: client.lat, lng: client.lng});
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);

    let rawdata = fs.readFileSync('bike_tracking.json');
    let trackingHistory = JSON.parse(rawdata);

    trackingHistory.push(path);

    let data = JSON.stringify(trackingHistory);
    fs.writeFileSync('bike_tracking.json', data);
  });

  socket.on('lobby', (clientObj) => {
    if (clientObj.type === 'sender') {
      console.log('im the sender', clientObj.socketId);
      const roomId = `${clientObj.socketId}-${uuidv4()}`;

      clientObj['roomId'] = roomId;

      socket.join(roomId);

      io.to(clientObj.socketId).emit('private message', clientObj);
    }
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

const express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
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
  console.log('a user connected');

  const path = [];

  socket.on('test-location', (client) => {
    path.push({lat: client.lat, lng: client.lng});
    console.log(path);
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

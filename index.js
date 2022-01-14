const express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3001;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

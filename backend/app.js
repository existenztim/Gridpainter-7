const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
var bodyParser = require('body-parser');
let grid = [];
let connectedUsers = {};
const colors = ['red', 'blue', 'yellow', 'green'];

async function init() {
  try {
    const options = { useNewUrlParser: true, useUnifiedTopology: true };
    await mongoose.connect(process.env.MONGODB_URI_LOCAL, options);
    console.log('Mongoose connected successful!');
  } catch (error) {
    console.error(error);
  }
}
init();

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

for (let y = 0; y < 15; y++) {
  let row = [];
  for (let x = 0; x < 15; x++) {
    row.push('white');
  }
  grid.push(row);
}

io.on('connection', (socket) => {
  function joinRequest() {
    if (Object.keys(connectedUsers).length <= 4) {
      const availableColors = colors.filter(color => !Object.values(connectedUsers).includes(color));
      const color = availableColors[0];
      connectedUsers[socket.id] = color;
      console.log("new user connected:", socket.id, "with color:", color);
      socket.emit('joinResponse', { color });
      socket.emit('gridData', { grid });
    } else {
      socket.emit('gameFull');
      return;
    }
  };


  socket.on('join', () => {
    joinRequest();
  });

  socket.on('updateGridCell', ({ x, y, color }) => {
    if (connectedUsers[socket.id]) {
      grid[y][x] = connectedUsers[socket.id];
      io.emit('updateGridCell', { x, y, color: connectedUsers[socket.id] });
      io.emit('gridData', { grid });
    }
  });

  socket.on('exitGame', () => {
    if (connectedUsers[socket.id]) {
      delete connectedUsers[socket.id];
      io.emit('updateUsersList', { users: Object.values(connectedUsers) });
    }
  socket.on('chat', (argument) => {
    console.log('incoming chat', argument, );
    io.emit('chat', argument);
  });
});
})

io.on('connection', (socket) => {
  socket.on('chat message', (message, username) => {
    io.emit('chat message', message, username);
  });

  io.emit('gridData', { grid });
  io.emit('updateUsersList', { users: Object.values(connectedUsers) });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);

server.listen(3000);
module.exports = { app: app, server: server };
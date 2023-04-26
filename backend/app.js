const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const indexRouter = require('./routes/index');
const referenceImageRouter = require('./routes/referenceImage');
const usersRouter = require('./routes/users');
var bodyParser = require('body-parser');
const ReferenceImage = require('./models/referenceImage');
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

let joinButtonCount = 0;

io.on('connection', (socket) => {
  async function joinRequest() {
    if (Object.keys(connectedUsers).length <= 4) {
      const availableColors = colors.filter(
        (color) => !Object.values(connectedUsers).includes(color)
      );
      const color = availableColors[0];
      connectedUsers[socket.id] = color;
      console.log('new user connected:', socket.id, 'with color:', color);
      socket.emit('joinResponse', { color });
      socket.emit('gridData', { grid });

      joinButtonCount++;
      if (joinButtonCount === 4) {
        io.emit('disableJoinButton');
      }

      if (Object.keys(connectedUsers).length === 1) {
        try {
          const response = await fetch('http://localhost:3000/referenceImage/randomGameImage');
          const referenceImage = await response.json();
          if (referenceImage !== null) {
            console.log('Loaded reference image from the database:', referenceImage);
            io.emit('referenceImageData', { referenceImage });
          } else {
            console.log('No reference image found in the database');
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      return;
    }
  }

  socket.on('join', () => {
    joinRequest();
    // connectedUsers[socket.id] = user.name;
  });

  socket.on('checkIfUserIsInGame', () => {
    const userInGame = Object.keys(connectedUsers).includes(socket.id);
    if (!userInGame) {
      socket.emit('gameFull');
    }
  });
  
  socket.on('updateGridCell', ({ x, y, color }) => {
    if (connectedUsers[socket.id]) {
      grid[y][x] = connectedUsers[socket.id];
      io.emit('updateGridCell', { x, y, color: connectedUsers[socket.id] });
      io.emit('gridData', { grid });
    }
  });

  socket.on('endGame', () => {
    connectedUsers = {};
    joinButtonCount = 0;
    grid = [];
    for (let y = 0; y < 15; y++) {
      let row = [];
      for (let x = 0; x < 15; x++) {
        row.push('white');
      }
      grid.push(row);
    }
    io.emit('gridData', { grid });
    io.emit('reloadButtons');
    io.emit('removeMessage');
  });

  socket.on('saveReferenceImage', ({ grid }) => {
    const referenceImage = new ReferenceImage({
      grid,
      createdOn: Date.now(),
    });
    referenceImage.save()
    .then((referenceImage) => {
      console.log('Reference image saved to MongoDB: ', referenceImage);
    })
    .catch((err) => {
      console.error(err);
    });
  });
});

io.on('connection', (socket) => {

  
  socket.on('chat message', (message, username, room) => {
    io.to(room).emit('chat message', `${username}: ${message}`);
    console.log(`Socket id: ${socket.id}: "${username}" wrote: ${message} in ${room}`);
  });
  socket.on("join-room", room => {
    socket.join(room);
    console.log(room);
  })
  //io.emit('gridData', { grid });
  //io.emit('updateUsersList', { users: Object.values(connectedUsers) });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/referenceImage', referenceImageRouter);
app.use('/users', usersRouter);

server.listen(3000);
module.exports = { app: app, server: server };
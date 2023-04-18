const app = require('express')();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const server = require('http').createServer(app);
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
var bodyParser = require('body-parser');

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

io.on('connection', (socket) => {
  console.log('Någon är här!');

  socket.on('disconnect', () => {
    console.log('Någon lämnade');
  });

  socket.on('chat', (arg) => {
    console.log('incoming chat', arg);
    io.emit('chat', arg);
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);

server.listen(3000);
module.exports = { app: app, server: server };

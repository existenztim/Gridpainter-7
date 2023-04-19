const app = require('express')();
const mongoose = require('mongoose');
require('dotenv').config();
const server = require('http').createServer(app);
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
var bodyParser = require('body-parser')

async function init(){
  try {
  const options = {useNewUrlParser: true, useUnifiedTopology: true}
  await mongoose.connect(process.env.MONGODB_URI_CLOUD, options); 
  console.log('Mongoose connected successful!');
} catch(error) {
  console.error(error)
  }
}
init()

app.get('/', (req, res) => {
  res.send('Hej socket server!');
});

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://127.0.0.1:5502',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Någon är här!');

  socket.on('disconnect', () => {
    console.log('Någon lämnade');
  });

  socket.on('chat', (argument) => {
    console.log('incoming chat', argument, );
    io.emit('chat', argument);
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (message, username) => {
    io.emit("chat message", message, "username", username)
  });
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', indexRouter);
app.use('/users', usersRouter);

server.listen(3003);
module.exports = {app: app, server: server};


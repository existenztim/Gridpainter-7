const app = require('express')();
const mongoose = require('mongoose');
require('dotenv').config();
const server = require('http').createServer(app);

async function init(){
  try {
  const options = {useNewUrlParser: true, useUnifiedTopology: true}
  await mongoose.connect(process.env.MONGODB_URI_LOCAL, options); 
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
    origin: 'http://localhost:5174',
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

server.listen(3000);

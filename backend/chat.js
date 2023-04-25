function chatHandler(io){
io.on('connection', (socket) => {
    socket.on('chat message', (message, username, room) => {
      io.to(room).emit('chat message', `${username}: ${message}`);
      console.log(`Socket id: ${socket.id}: "${username}" wrote: ${message} in ${room}`);
    });
   socket.on("join-room", (room, username, message) => {
      socket.emit('join-room', room, username); 
      socket.join(room);
      io.to(room).emit('chat message', `${username} joined the chat!`); 
    })
  });
}
module.exports = chatHandler;
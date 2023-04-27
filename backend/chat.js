function chatHandler(io){
io.on('connection', (socket) => {
    socket.on('chat message', (message, username, room) => {
      io.to(room).emit('chat message', `${username}: ${message}`);
      console.log(`Socket id: ${socket.id}: "${username}" wrote: ${message} in ${room}`);
    });

    socket.on('typing', (username, room) => {
      socket.to(room).emit('typing', username);
    });

    socket.on('stop typing', (username, room) => {
      socket.to(room).emit('stop typing', username);
    });
    
   socket.on("join-room", (room, username, message) => {
      socket.emit('join-room', room, username); 
      socket.join(room);
      io.to(room).emit('chat message', `${username}: I just joined this chat room, say hello!`); 
    });
  });
}
module.exports = chatHandler;
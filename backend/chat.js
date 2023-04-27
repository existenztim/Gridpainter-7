function chatHandler(io){
  io.on('connection', (socket) => {
      socket.on('chat message', (message, username, room) => {
        io.to(room).emit('chat message', `${username}: ${message}`);
        console.log(`Socket id: ${socket.id}: "${username}" wrote: ${message} in ${room}`);
      });

     socket.on("join-room", (room, username, message) => {
        socket.emit('join-room', room, username); 
        if(room == "room1"  //Safety check if client manipulate DOM
        || room == "room2"
        || room == "room3"){
          socket.join(room); //join new room
          io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just joined this chat room, say hello!`); 
        }
      });

      socket.on("leave-room", (room, username, message) => {
        socket.emit('leave-room', room, username); 
        socket.leave(room); //Leave current rooms (if any)
        io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just left this chat room, Goodbye!`); 
      });
    });
  }
module.exports = chatHandler;
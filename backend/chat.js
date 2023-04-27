function chatHandler(io){
  let userCounts = {
    room1: 0,
    room2: 0,
    room3: 0
  }
  let userSet = new Set(); 
  
  io.on('connection', (socket) => {
      socket.on('chat message', (message, username, room) => {
        io.to(room).emit('chat message', `${username}: ${message}`);
        socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
        console.log(`Socket id: ${socket.id}: "${username}" wrote: ${message} in ${room}`);
      });

     socket.on("join-room", (room, username, message) => {
        socket.emit('join-room', room, username); 
        if(room == "room1"  //Safety check if client manipulate DOM
        || room == "room2"
        || room == "room3"){
          if(!userSet.has(username)) { // Check if username is already present in set
            socket.join(room); //join new room
            userCounts[room]++;
            userSet.add(username); // Add username to set
            socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
            console.log(`Number of users in ${room}: ${userCounts[room]}`);
            io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just joined this chat room, say hello!`); 
          }
        }
      });

      socket.on("leave-room", (room, username, message) => {
        socket.emit('leave-room', room, username); 
        socket.leave(room); //Leave current rooms (if any)
        userCounts[room]--;
        userSet.delete(username); // Delete username from set
        socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
        console.log(`Number of users in ${room}: ${userCounts[room]}`);
        io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just left this chat room, Goodbye!`); 
      });
    });
  }

module.exports = chatHandler;
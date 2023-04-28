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

    socket.on('typing', (username, room) => {
      socket.to(room).emit('typing', username);
    });

    socket.on('stop typing', (username, room) => {
      socket.to(room).emit('stop typing', username);
    });

    socket.on('room-feedback', (room, userCounts) => {
      socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
    });

    socket.on("join-room", (room, username) => {
          socket.emit('join-room', room, username); 
          if(room == "room1"  //Safety check if client manipulate DOM
          || room == "room2"
          || room == "room3"){
            if(!userSet.has(username)) { // Check if username is already present in set
              userCounts[room]++;
            }
              socket.join(room); //join new room
              userSet.add(username); // Add username to set
              socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
              console.log(`Number of users in ${room}: ${userCounts[room]}`);
              io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just joined this chat room, say hello!`);        
          }
        });

      socket.on("leave-room", (room, username, message) => {
        socket.emit('leave-room', room, username); 
        if(userSet.has(username)) { 
          userCounts[room] = Math.max(userCounts[room] - 1, 0); //Never below 0
        }
        socket.leave(room); //Leave current rooms (if connected to any)
        userSet.delete(username); // Delete username from set
        socket.broadcast.emit('room-feedback', `${room} : ${userCounts[room]} users online`);
        console.log(`Number of users in ${room}: ${userCounts[room]}`);
        io.to(room).emit('chat message', `[AUTO-GENERATED] ${username}: I just left this chat room, Goodbye!`); 
      });;
    });
  }

module.exports = chatHandler;
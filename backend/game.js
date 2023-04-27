const ReferenceImage = require('./models/referenceImage');
let grid = [];
let connectedUsers = {};
let joinButtonCount = 0;
let endGameButtonCount = 0;
const colors = ['red', 'blue', 'yellow', 'green'];

function gameHandler(io) {
  for (let y = 0; y < 15; y++) {
    let row = [];
    for (let x = 0; x < 15; x++) {
      row.push('white');
    }
    grid.push(row);
  }

  io.on('connection', (socket) => {
    async function joinRequest() {
      if (Object.keys(connectedUsers).length <= 4) {
        const availableColors = colors.filter(
          (color) => !Object.values(connectedUsers).includes(color)
        );
        const color = availableColors[0];
        connectedUsers[socket.id] = color;
        console.log('new user connected:', socket.id, 'with color:', color);
        socket.emit('gridData', { grid });
        socket.emit('joinResponse', { color });

        joinButtonCount++;
        if (joinButtonCount === 4) {
          io.emit('disableJoinButton');
        }

        if (Object.keys(connectedUsers).length === 1) {
          io.emit('onePlayerJoined');
          io.emit('disableEndGameButton');
        }

        if (Object.keys(connectedUsers).length === 2) {
          io.emit('twoPlayersJoined');
          io.emit('disableEndGameButton');
        }

        if (Object.keys(connectedUsers).length === 3) {
          io.emit('threePlayersJoined');
          io.emit('disableEndGameButton');
        }

        if (Object.keys(connectedUsers).length === 4) {
          try {
            const response = await fetch(
              'http://localhost:3000/referenceImage/randomGameImage'
            );
            const referenceImage = await response.json();
            if (referenceImage !== null) {
              console.log(
                'Loaded reference image from the database:',
                referenceImage
              );
              io.emit('referenceImageData', { referenceImage });
            } else {
              console.log('No reference image found in the database');
            }
          } catch (error) {
            console.error(error);
          }
          io.emit('startTimer');
          io.emit('fourPlayersJoined');
          io.emit('enableEndGameButton');
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
      endGameButtonCount++;
      if (endGameButtonCount === 1) {
        io.emit('onePlayerHasFinished');
      }

      if (endGameButtonCount === 2) {
        io.emit('twoPlayersHaveFinished');
      }

      if (endGameButtonCount === 3) {
        io.emit('threePlayersHaveFinished');
      }

      if (endGameButtonCount === 4) {
        io.emit('fourPlayersHaveFinished');
      }
    });

    socket.on('clearGame', () => {
      connectedUsers = {};
      joinButtonCount = 0;
      endGameButtonCount = 0;
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
      io.emit('clearCanvas');
      io.emit('stopTimer');
    });

    socket.on('saveReferenceImage', ({ grid }) => {
      const referenceImage = new ReferenceImage({
        grid,
        createdOn: Date.now(),
      });
      referenceImage
        .save()
        .then((referenceImage) => {
          console.log('Reference image saved to MongoDB: ', referenceImage);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
}

module.exports = gameHandler;

import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io("https://sea-lion-app-cr49a.ondigitalocean.app");
let user = JSON.parse(localStorage.getItem('user'));
console.log(user);

export function printGame() {
  user = JSON.parse(localStorage.getItem('user'));
  const game = document.querySelector('#game');
  game.innerHTML = /*html*/ `
  <button id='joinButton'>Join game</button>
  <button id='saveReferenceButton'>Save reference image</button>
  <button id='saveButton'>Save image</button>
  <button id='loadButton'>Load image</button>
  <div id="saveLoadMsg"></div>
  <h3 id="timer"></h3>
  <div id="gameContainer">
    <table id="grid" border="1"></table>
    <canvas id='referenceCanvas' width='150' height='150'></canvas>
  </div>`;

  socket.on('gridData', ({ grid }) => {
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const cell = grid[y][x];
        const gridCell = document.getElementById(`cell-${x}-${y}`);
        gridCell.style.backgroundColor = cell;
      }
    }
  });

  const joinButton = document.getElementById('joinButton');
  joinButton.addEventListener('click', () => {
    socket.emit('join');
    joinButton.remove();
    const endGameButton = document.createElement('button');
    endGameButton.id = 'endGameButton';
    endGameButton.innerText = 'End game';
    game.prepend(endGameButton);
    endGameButton.addEventListener('click', () => {
      endGameButton.disabled = true;
      socket.emit('endGame');
    });
  });

  socket.on('disableJoinButton', () => {
    joinButton.disabled = true;

    socket.emit('checkIfUserIsInGame');
    socket.on('gameFull', () => {
      const gridTable = document.getElementById('grid');
      const fullGameMessage = document.getElementById('fullGameMessage');
      if (fullGameMessage) {
        fullGameMessage.remove();
      }
      const message = document.createElement('h2');
      message.id = 'fullGameMessage';
      message.innerText = 'The game is currently full';
      gridTable.before(message);
    });
  });

  socket.on('disableEndGameButton', () => {
    const endGameButton = document.getElementById('endGameButton');
    endGameButton.disabled = true;
  });

  socket.on('enableEndGameButton', () => {
    const endGameButton = document.getElementById('endGameButton');
    endGameButton.disabled = false;
  });

  socket.on('reloadButtons', () => {
    const endGameButton = document.getElementById('endGameButton');
    if (endGameButton) {
      endGameButton.remove();
    }

    game.prepend(joinButton);
    joinButton.disabled = false;
  });

  const saveRefButton = document.getElementById('saveReferenceButton');
  saveRefButton.addEventListener('click', () => {
    const grid = [];
    for (let y = 0; y < 15; y++) {
      let row = [];
      for (let x = 0; x < 15; x++) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        row.push(cell.style.backgroundColor);
      }
      grid.push(row);
    }
    socket.emit('saveReferenceImage', { grid });
  });

  const saveBtn = document.querySelector('#saveButton');
  saveBtn.addEventListener('click', saveGrid);

  const loadBtn = document.querySelector('#loadButton');
  loadBtn.addEventListener('click', loadGrid);

  createGrid();
}

let referenceImage;

socket.on('referenceImageData', ({ referenceImage: data }) => {
  referenceImage = data;
  const referenceCanvas = document.getElementById('referenceCanvas');
  const referenceContext = referenceCanvas.getContext('2d');
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const cell = referenceImage.grid[y][x];
      referenceContext.fillStyle = cell;
      referenceContext.fillRect(y * 10, x * 10, 10, 10);
    }
  }
});

function printResults() {
  const grid = [];
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    grid.push(cell.style.backgroundColor);
  });

  if (referenceImage !== null) {
    const matchingCells = grid.reduce((acc, cell, index) => {
      return acc + (cell === referenceImage.grid.flat()[index] ? 1 : 0);
    }, 0);
    const accuracy = Math.round((matchingCells / (15 * 15)) * 100);

    const gameContainer = document.getElementById('gameContainer');
    const message = document.createElement('h3');
    message.id = 'resultMessage';
    if (accuracy === 100) {
      message.innerText = `And the results are in:\n100% It's a perfect match!\n\nClick 'Join game' to start a new game!`;
    } else {
      message.innerText = `And the results are in:\nAccuracy: ${accuracy}%\n\nClick 'Join game' to start a new game!`;
    }
    gameContainer.before(message);
  } else {
    console.log('Reference image not found');

    const saveBtn = document.querySelector('#saveButton');
    saveBtn.addEventListener('click', saveGrid);

    const loadBtn = document.querySelector('#loadButton');
    loadBtn.addEventListener('click', loadGrid);
  }
}

function saveGrid() {
  const grid = [];
  for (let y = 0; y < 15; y++) {
    let row = [];
    for (let x = 0; x < 15; x++) {
      const cell = document.getElementById(`cell-${x}-${y}`);
      row.push(cell.style.backgroundColor);
    }
    grid.push(row);
  }

  fetch('https://sea-lion-app-cr49a.ondigitalocean.app/images/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
    },
    body: JSON.stringify({
      userId: user.id,
      grid,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const saveLoadMsg = document.querySelector('#saveLoadMsg');
      saveLoadMsg.innerHTML = 'Image saved!';
    });
}

function loadGrid() {
  fetch('https://sea-lion-app-cr49a.ondigitalocean.app/images/load', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
    },
    body: JSON.stringify({ userId: user.id }),
  })
    .then((response) => response.json())
    .then((data) => {
      const saveLoadMsg = document.querySelector('#saveLoadMsg');
      saveLoadMsg.innerHTML = '';
      data.map((img) => {
        saveLoadMsg.innerHTML += `
      <button class="loadGridBtn" data-id="${img._id}">${img.createdOn}</button>`;
      });
      const btns = document.querySelectorAll('.loadGridBtn');
      btns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const image = data.filter(
            (img) => img._id === e.currentTarget.dataset.id
          );
          console.log(image[0]);
          let referenceImage = image[0];
          const referenceCanvas = document.getElementById('referenceCanvas');
          const referenceContext = referenceCanvas.getContext('2d');
          for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
              const cell = referenceImage.grid[x][y];
              referenceContext.fillStyle = cell;
              referenceContext.fillRect(y * 10, x * 10, 10, 10);
            }
          }
        });
      });
    });
}

const connectedUsers = {};

function createGrid() {
  const gridTable = document.getElementById('grid');
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('id', `cell-${x}-${y}`);

      cell.addEventListener('click', () => {
        const color = connectedUsers[socket.id];
        cell.style.backgroundColor = color;
        socket.emit('updateGridCell', { x, y, color });
      });

      gridTable.append(cell);
    }
  }
}

socket.on('joinResponse', ({ color }) => {
  console.log(`Joined with color ${color}`);
});

socket.on('removeMessage', () => {
  const fullGameMessage = document.getElementById('fullGameMessage');
  if (fullGameMessage) {
    fullGameMessage.remove();
  }
});

socket.on('clearCanvas', () => {
  const referenceCanvas = document.getElementById('referenceCanvas');
  const referenceContext = referenceCanvas.getContext('2d');
  referenceContext.clearRect(
    0,
    0,
    referenceCanvas.width,
    referenceCanvas.height
  );
});

socket.on('startTimer', () => {
  const timer = document.getElementById('timer');
  const minutesFromStart = 3;
  let time = minutesFromStart * 60;
  const myInterval = setInterval(() => {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;
    timer.innerHTML = `Time left: ${minutes}:${seconds}`;
    time--;
    time = time < -1 ? -1 : time;

    if (time < 30) {
      timer.classList.add('redNumbers');
    } else {
      timer.classList.remove('redNumbers');
    }

    if (time === -1) {
      clearInterval(myInterval);
      socket.emit('endGame');
      timer.innerHTML = '';
    }
  }, 1000);

  socket.on('stopTimer', () => {
    clearInterval(myInterval);
    timer.innerHTML = '';
  });
});

socket.on('onePlayerJoined', () => {
  const gameContainer = document.getElementById('gameContainer');
  const resultMessage = document.getElementById('resultMessage');
  if (resultMessage) {
    resultMessage.remove();
  }
  const message = document.createElement('h3');
  message.id = 'playersJoined';
  message.innerText =
    'One player has joined the game. Waiting for three more players to join!';
  gameContainer.before(message);

  socket.on('twoPlayersJoined', () => {
    const playersJoinedMessage = document.getElementById('playersJoined');
    if (playersJoinedMessage) {
      playersJoinedMessage.remove();
    }
    message.innerText =
      'Two players have joined the game. Waiting for two more players to join!';
    gameContainer.before(message);
  });

  socket.on('threePlayersJoined', () => {
    const playersJoinedMessage = document.getElementById('playersJoined');
    if (playersJoinedMessage) {
      playersJoinedMessage.remove();
    }
    message.innerText =
      'Three players have joined the game. Waiting for one more player to join!';
    gameContainer.before(message);
  });
});

socket.on('fourPlayersJoined', () => {
  const gameContainer = document.getElementById('gameContainer');
  const playersJoinedMessage = document.getElementById('playersJoined');
  if (playersJoinedMessage) {
    playersJoinedMessage.remove();
  }
  const message = document.createElement('h3');
  message.id = 'playersJoined';
  message.innerText = 'The game has started. Good luck!';
  gameContainer.before(message);
});

socket.on('onePlayerHasFinished', () => {
  const gameContainer = document.getElementById('gameContainer');
  const playersJoinedMessage = document.getElementById('playersJoined');
  if (playersJoinedMessage) {
    playersJoinedMessage.remove();
  }
  const message = document.createElement('h3');
  message.id = 'playersFinished';
  message.innerText =
    "One player has finished the game. Click 'End game' when you're ready!";
  gameContainer.before(message);

  socket.on('twoPlayersHaveFinished', () => {
    const playersFinishedMessage = document.getElementById('playersFinished');
    if (playersFinishedMessage) {
      playersFinishedMessage.remove();
    }
    message.innerText =
      "Two players have finished the game. Click 'End game' when you're ready!";
    gameContainer.before(message);
  });

  socket.on('threePlayersHaveFinished', () => {
    const playersFinishedMessage = document.getElementById('playersFinished');
    if (playersFinishedMessage) {
      playersFinishedMessage.remove();
    }
    message.innerText =
      "Three players have finished the game. Click 'End game' when you're ready!";
    gameContainer.before(message);
  });
});

socket.on('fourPlayersHaveFinished', () => {
  const playersFinishedMessage = document.getElementById('playersFinished');
  if (playersFinishedMessage) {
    playersFinishedMessage.remove();
  }
  printResults();
  socket.emit('clearGame');
});

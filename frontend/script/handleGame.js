import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io('http://localhost:3000');
const user = JSON.parse(localStorage.getItem('user'));
console.log(user);

export function printGame() {
  const game = document.querySelector('#game');
  game.innerHTML += /*html*/ `
  <button id='joinButton'>Join game</button>
  <button id='saveReferenceButton'>Save reference image</button>
  <button id='resultButton'>Show results</button>
  <button id='saveButton'>Save</button>
  <button id='loadButton'>Load</button>
  <h2 id="timer"></h2>
  <table id="grid" border="1"></table>
  <canvas id='referenceCanvas' width='150' height='150'></canvas>`;

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

  createGrid();

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

  const resultsButton = document.getElementById('resultButton');
  resultsButton.addEventListener('click', () => {
    const grid = [];
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
      grid.push(cell.style.backgroundColor);
    });

    if (referenceImage !== null) {
      const paintedGrid = JSON.stringify(grid);
      const referenceGrid = JSON.stringify(referenceImage.grid);
      if (paintedGrid === referenceGrid) {
        console.log("100% It's a perfect match!");
      } else {
        const matchingCells = grid.reduce((acc, cell, index) => {
          return acc + (cell === referenceImage.grid.flat()[index] ? 1 : 0);
        }, 0);
        const accuracy = (matchingCells / (15 * 15)) * 100;
        console.log(`Accuracy: ${accuracy}%`);
      }
    } else {
      console.log('Reference image not found');
    }
  });

  const saveBtn = document.querySelector('#saveButton');
  saveBtn.addEventListener('click', saveGrid);

  const loadBtn = document.querySelector('#loadButton');
  loadBtn.addEventListener('click', loadGrid);
}

function saveGrid() {
  const grid = [];
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    grid.push(cell.style.backgroundColor);
  });

  fetch('http://localhost:3000/images/save', {
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
    .then((data) => console.log(data));
}

function loadGrid() {
  fetch('http://localhost:3000/images/load', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
    },
    body: JSON.stringify({ userId: user.id }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
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

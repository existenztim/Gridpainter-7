import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io('http://localhost:3000');

export function printGame() {
    const game = document.querySelector('#game');
    game.innerHTML += /*html*/`
    <button id='joinButton'>Join game</button>
    <button id='saveReferenceButton'>Save reference image</button>
    <button id='resultButton'>Show results</button>
    <table id="grid" border="1"></table>
    <canvas id='referenceCanvas' width='150' height='150'></canvas>`;
  
    const joinButton = document.getElementById('joinButton');
    const exitButton = document.createElement('button');
    exitButton.innerText = 'Exit game';
  
    socket.on('gridData', ({ grid }) => {
      for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
          const cell = grid[y][x];
          const gridCell = document.getElementById(`cell-${x}-${y}`);
          gridCell.style.backgroundColor = cell;
        }
      }
    });
  
    joinButton.addEventListener('click', () => {
      socket.emit('join');
      joinButton.remove();
      game.prepend(exitButton);
      exitButton.addEventListener('click', () => {
        socket.emit('exitGame');
        exitButton.remove();
        game.prepend(joinButton);
      });
    });

    const saveButton = document.getElementById('saveReferenceButton');
    saveButton.addEventListener('click', () => {
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

    function fetchReferenceImage() {
      return fetch('http://localhost:3000/referenceImage/randomGameImage')
        .then(response => response.json())
        .then(data => {
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
        })
        .catch(error => console.error(error));
    }
    
    fetchReferenceImage();

    const resultsButton = document.getElementById('resultButton');
    resultsButton.addEventListener('click', () => {
      const grid = [];
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
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
  
  socket.on('gameFull', () => {
    const gridTable = document.getElementById('grid');
    gridTable.style.pointerEvents = 'none';
    const message = document.createElement('h2');
    message.innerText = 'The game is currently full';
    gridTable.before(message);
  
    socket.on('joinResponse', () => {
      message.remove();
      gridTable.style.pointerEvents = 'auto';
    });
  });
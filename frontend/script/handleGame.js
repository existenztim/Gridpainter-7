import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
const socket = io('http://localhost:3003');

export function printGame() {
    const game = document.querySelector('#game');
    game.innerHTML += /*html*/`
    <button id='joinButton'>Join game</button>
    <table id="grid" border="1"></table>`;
  
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
  
    createGrid();
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
  
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3000');

socket.on('chat', (arg) => {
  console.log('chat', arg);
});

const app = document.querySelector('#app');
const game = document.querySelector('#game');
let user = JSON.parse(localStorage.getItem('user'));
const BASE_URL = 'http://localhost:3000';

function checkLogin() {
  user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    printGame();
  } else {
    printLogin();
  }
}

function printGame() {
  app.innerHTML = `
  <h1>Welcome, ${user.name}</h1>
  <button id="logoutBtn">Logout</button>`

  game.innerHTML += `
  <button id='joinButton'>Join game</button>
  <table id="grid" border="1"></table>`;

  const joinButton = document.getElementById('joinButton');
  const exitButton = document.createElement('button');
  exitButton.innerText = 'Exit game';

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

  const logoutBtn = document.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    checkLogin();
  });
}

function printLogin() {
  app.innerHTML = `
   <div id="loginContainer">
   <form id="loginUser">
      <div id="loginMessage"></div>
      <input id="loginUsername" type="text" placeholder="Username">
      <br>
      <input id="loginPassword" type="password" placeholder="Password">
      <br>
      <button>Login</button>
    </form>
    <form id="createUser">
      <div id="createMessage"></div>
      <input id="createUsername" type="text" placeholder="Username">
      <br>
      <input id="createPassword" type="password" placeholder="Password">
      <br>
      <button>Create</button>
    </form>
   </div> 
  `;

  const loginUserForm = document.querySelector('#loginUser');
  loginUserForm.addEventListener('submit', loginUser);

  const createUserForm = document.querySelector('#createUser');
  createUserForm.addEventListener('submit', createUser);
}

function loginUser(e) {
  e.preventDefault();

  const name = document.querySelector('#loginUsername').value;
  const password = document.querySelector('#loginPassword').value;

  if (name && password) {
    const user = { name, password };

    fetch(BASE_URL + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw response.json();
        }
      })
      .then((data) => {
        localStorage.setItem('user', JSON.stringify(data));
        checkLogin();
      })
      .catch((err) => {
        const message = document.querySelector('#loginMessage');
        message.innerHTML = "Name and password don't match.";
      });
  }
}

function createUser(e) {
  e.preventDefault();

  const name = document.querySelector('#createUsername').value;
  const password = document.querySelector('#createPassword').value;

  if (name && password) {
    const user = { name, password };

    fetch(BASE_URL + '/users/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } else {
          throw response.json();
        }
      })
      .then((data) => {
        const message = document.querySelector('#createMessage');
        message.innerHTML = 'User created!';
      })
      .catch((err) => {
        const message = document.querySelector('#createMessage');
        message.innerHTML = 'Name is already taken.';
      });
  }
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

socket.on('gridData', ({ grid }) => {
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const cell = grid[y][x];
      const gridCell = document.getElementById(`cell-${x}-${y}`);
      gridCell.style.backgroundColor = cell;
    }
  }
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

checkLogin();
import './style.scss';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3000');

// socket.on('chat', (arg) => {
//   console.log('chat', arg);
// });

const app = document.querySelector('#app');
const game = document.querySelector('#game');
let user = JSON.parse(localStorage.getItem('user'));
const BASE_URL = 'http://localhost:3000';

function checkLogin() {
  user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    printChat();
    printGame();
  } else {
    printLogin();
  }
}

function printChat() {
  app.innerHTML = /*html*/ `
  <h1>Welcome, ${user.name}</h1>
  <button id="logoutBtn">Logout</button>
  <h2 id="chatFeedback"></h2>
  <form class="form">
  <input class="input" type="text">
  <select name="rooms" id="roomSelect">
  <option value="">--Please choose a room to join--
    <option value="room1">Room 1</option>
    <option value="room2">Room 2</option>
    <option value="room3">Room 3</option>
  </option>
  </select>
  <button class="roomButton">Join Room</button>
  <button class="submitButton">Send</button>
  </form>
  <ul class="messages"></ul>
 `;

  const form = document.querySelector('.form');
  const input = document.querySelector('.input');
  const messages = document.querySelector('.messages');
  const joinRoomBtn = document.querySelector(".roomButton");
  const selectedRom = document.querySelector("#roomSelect"); 
  const chatFeedBack = document.querySelector("#chatFeedback");

  form.addEventListener('submit', function (event) {
    event.preventDefault();
   const room = selectedRom.value;
    if (input.value && room.length > 0) {
      displayMessage(input.value);
      socket.emit('chat message', input.value, user.name, room);
      input.value = '';
      chatFeedBack.innerText=`${room}`;
    } else {
      chatFeedBack.innerText="You either try to send an empty message or haven't joined a room."
    }
  });

  joinRoomBtn.addEventListener("click", () => {
    const room = selectedRom.value;
    socket.emit("join-room", room)
    console.log(`joined room :${room}`);
  })

  socket.on('chat', (arg) => {
    console.log('chat', arg);
  });
  

  socket.on('chat message', function (message) {
    const [username, text] = message.split(': ');
    const chatTextLi = document.createElement('li');
    chatTextLi.innerHTML = `<strong>${username}:</strong> ${text}`;

    if (username === user.name) {
      chatTextLi.classList.add('sent');
    } else {
      chatTextLi.classList.add('received');
    }

    messages.appendChild(chatTextLi);
  });
}
// function displayMessage(message) {
//   const li = document.createElement("li");
//   li.textContent = message;
//   document.querySelector(".messages").append(li);
// }

function printGame() {
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

 

  const logoutBtn = document.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    game.innerHTML = '';
    checkLogin();
  });
}

function printLogin() {
  app.innerHTML = /*html*/`
   <div id="loginContainer">
    <form id="loginUser">
      <h4>Login:</h4>
      <div id="loginMessage"></div>
      <input id="loginUsername" type="text" placeholder="Username">
      <br>
      <input id="loginPassword" type="password" placeholder="Password">
      <br>
      <button>Login</button>
    </form>
    <form id="createUser">
      <h4>Create user:</h4>
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
    localStorage.setItem('user', JSON.stringify(user));

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

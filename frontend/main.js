import './style.scss';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3003');

socket.on('chat', (arg) => {
  console.log('chat', arg);
});

const form = document.querySelector('.form');
const input = document.querySelector('.input');
const messages = document.querySelector(".messages");

form.addEventListener('submit', function(event) {
  event.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value, );
    input.value = '';
  }
});

socket.on('chat message', function(message) {
  const chatTextLi = document.createElement('li');
  chatTextLi.textContent = message;
  messages.appendChild(chatTextLi);
  window.scrollTo(0, document.body.scrollHeight);
});


const app = document.querySelector('#app');
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
   <button id="logoutBtn">Logout</button>
   <table id="grid" border="1"></table>`;

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

function createGrid() {
  let grid = document.getElementById('grid');

  for (let i = 0; i < 16; i++) {
    let row = document.createElement('tr');
    row.classList.add('tr');

    for (let j = 0; j < 16; j++) {
      let cell = document.createElement('td');
      cell.classList.add('td');

      cell.addEventListener('click', () => {
        console.log(i, j);
      });

      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

checkLogin();

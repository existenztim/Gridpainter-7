import './style.scss';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3000');

socket.on('chat', (arg) => {
  console.log('chat', arg);
});

const app = document.querySelector('#app');

const BASE_URL = 'http://localhost:3000';

function printLogin() {
  app.innerHTML = `
   <div id="loginContainer">
    <form id="loginUser">
      <input id="loginUsername" type="text" placeholder="Username">
      <br>
      <input id="loginPassword" type="password" placeholder="Password">
      <br>
      <button>Login</button>
    </form>
    <form id="createUser">
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

  const name = document.querySelector('#loginUsername');
  const password = document.querySelector('#loginPassword');

  if (name && password) {
    const user = { name, password };

    fetch('');
  }
}

function createUser(e) {
  e.preventDefault();

  const name = document.querySelector('#createUsername');
  const password = document.querySelector('#createPassword');
}

printLogin();

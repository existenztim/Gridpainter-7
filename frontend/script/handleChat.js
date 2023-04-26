import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import { checkLogin } from '../main';
const BASE_URL = 'http://localhost:3000';
const CLOUD_URL = 'https://sea-lion-app-cr49a.ondigitalocean.app';

export function printChat() {
    const socket = io(CLOUD_URL);
    let user = JSON.parse(localStorage.getItem('user'));
    const app = document.querySelector('#app');
    app.innerHTML = /*html*/ `
    <h1>Welcome, ${user.name}</h1>
    <button id="logoutBtn">Logout</button>
    <h2 id="chatFeedback"></h2>
    <h3 id="roomNumber"></h3>
    <ul class="messages"></ul>
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
   
   `;
  
    const form = document.querySelector('.form');
    const input = document.querySelector('.input');
    const messages = document.querySelector('.messages');
    const joinRoomBtn = document.querySelector(".roomButton");
    const selectedRom = document.querySelector("#roomSelect"); 
    const chatFeedBack = document.querySelector("#chatFeedback");
    const roomNumber = document.querySelector("#roomNumber");
  
    form.addEventListener('submit', function (event) {
      event.preventDefault();
     const room = selectedRom.value;
      if (input.value && room.length > 0) {
        socket.emit('chat message', input.value, user.name, room);
        input.value = '';
        chatFeedBack.innerText="";
      } else if (input.value){
        chatFeedBack.innerText="You haven't joined a room.";
        roomNumber.innerText= "";
      }
    });
  
    joinRoomBtn.addEventListener("click", () => {
      const room = selectedRom.value;
      if (room){    
      messages.innerHTML= "";
      roomNumber.innerText=`Chatting in: ${room}`;
      socket.emit("join-room", room)
      console.log(`joined room :${room}`);
    } else {
      roomNumber.innerText= "";
    }
    })
    const logoutBtn = document.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      game.innerHTML = '';
      checkLogin();
    });

    socket.on('chat', (arg) => {
      console.log('chat', arg);
    });
    
  
    socket.on('chat message', function (message) {
      const [username, text] = message.split(': ');
      const chatTextLi = document.createElement('li');
      chatTextLi.innerHTML = `<span>11:00 </span><strong>${username}:</strong> ${text}`;
  
      if (username === user.name) {
        chatTextLi.classList.add('sent');
      } else {
        chatTextLi.classList.add('received');
      }
  
      messages.appendChild(chatTextLi);
    });
  }
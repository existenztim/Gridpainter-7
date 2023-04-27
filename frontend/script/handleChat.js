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
    <h2 id="chatFeedback"></h2>
    <h3 id="roomNumber"></h3>
    <ul id="roomList">
      <li class="roomCounter">Room1: 0 users online</li>
      <li class="roomCounter">Room2: 0 users online</li>
      <li class="roomCounter">Room3: 0 users online</li>
    </ul>
    <div class="chatbox"></div>
    <ul class="messages"></ul>
    <div class="typingIndicator"></div>
    <form class="form">
    <input class="input" type="text">
    <button class="submitButton">Send</button>
    <select name="rooms" id="roomSelect">
    <option value="">--Please choose a room to join--
      <option value="room1">Room 1</option>
      <option value="room2">Room 2</option>
      <option value="room3">Room 3</option>
    </option>
    </select>
    <button class="roomButton">Join chatroom</button>
    </form>
    <button id="logoutBtn">Logout</button>
   `;
    let isTyping = false;
    const form = document.querySelector('.form');
    const input = document.querySelector('.input');
    const messages = document.querySelector('.messages');
    const joinRoomBtn = document.querySelector(".roomButton");
    const selectedRom = document.querySelector("#roomSelect"); 
    const chatFeedBack = document.querySelector("#chatFeedback");
    const roomNumber = document.querySelector("#roomNumber");
    const typingIndicator = document.querySelector(".typingIndicator");
    const chatbox = document.querySelector(".chatbox");
    
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      const regex1 = /<3/g;
      const regex2 = /:\)/g;
      const regex3 = /:D/g;
      const regex4 = /:\(/g;
      if (regex1.test(value)) {
        e.target.value = value.replace(regex1, '❤️');
      }
      if (regex2.test(value)) {
        e.target.value = value.replace(regex2, '😊');
      }
      if (regex3.test(value)) {
        e.target.value = value.replace(regex3, '😁');
      }
      if (regex4.test(value)) {
        e.target.value = value.replace(regex4, '😞');
      }
      if (value.trim().length > 0) {
        isTyping = true;
        socket.emit("typing", selectedRom.value, user.name);
        indicateTyping(user.name);
      } else {
        isTyping = false;
        socket.emit("stopped typing", selectedRom.value, user.name);
        clearTimeout(typingTimeout);
      }
      const submitButton = document.querySelector(".submitButton");
      submitButton.addEventListener("click", () => {
         isTyping = false;
      })
    });

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
  
    joinRoomBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const room = selectedRom.value;
      if (room){    
      messages.innerHTML= "";
      roomNumber.innerText=`Chatting in: ${room}`;
      if(!joinRoomBtn.classList.contains("inRoom")){
        socket.emit("join-room", room, user.name);
        joinRoomBtn.classList.toggle("inRoom");
        joinRoomBtn.innerText ="Leave Chatroom";
        selectedRom.disabled = true;
      } else {
        socket.emit("leave-room", room, user.name);
        joinRoomBtn.classList.toggle("inRoom");
        joinRoomBtn.innerText ="Join chatroom";
        roomNumber.innerText= "";
        selectedRom.disabled = false;
      }
     
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

    socket.on('room-feedback', function (message){
      let roomUpdate;
      if (message.startsWith("room1")){
        roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(1)");
      }
      if (message.startsWith("room2")){
        roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(2)");
      }
      if (message.startsWith("room3")){
        roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(3)");
      }
      let messageCapitalize = message.charAt(0).toUpperCase();
      roomUpdate.innerHTML = messageCapitalize + message.slice(1);
    });
    socket.on('typing', (username) => {
      indicateTyping()
    });
    
    socket.on('stop typing', (username) => {
      isTyping = false;
    });

    socket.on('chat message', function (message) {
      let [username, text] = message.split(': ');
      const chatTextLi = document.createElement('li');
      const time = new Date();
      const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      const formattedTime = time.toLocaleTimeString("en-US", timeOptions);
      chatTextLi.innerHTML = `<strong>${username} : </strong> ${text}<br> <span>${formattedTime}</span>`;
      
  
      if (username === user.name) {
        chatTextLi.classList.add('sent');
      } else if (username.startsWith('[AUTO-GENERATED]')) {
        chatTextLi.classList.add('autoText');
      } else {
        chatTextLi.classList.add('received');
      }
      chatbox.appendChild(messages);
      messages.appendChild(chatTextLi);
    });

let typingTimeout;

function indicateTyping(username) {
  typingIndicator.style.display = "flex";
  typingIndicator.innerHTML = 
  `<span>${username} is typing...</span>
  <div class="dots-container">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
  </div>`;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    typingIndicator.style.visibility = 'hidden';
    clearTimeout(typingTimeout);
    }, 2000);
  }
};




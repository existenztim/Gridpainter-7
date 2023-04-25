import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import { checkLogin } from '../main';
import moment from "moment";

export function printChat() {
    const socket = io('http://localhost:3000');
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
  
    joinRoomBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const room = selectedRom.value;
      if (room){    
      messages.innerHTML= "";
      roomNumber.innerText=`Chatting in: ${room}`;
      socket.emit("join-room", room, user.name);
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
      let [username, text] = message.split(': ');
      const chatTextLi = document.createElement('li');
      const timestap = moment(document.createDate).format("HH:mm:ss")
      chatTextLi.innerHTML = `<span>${timestap} </span><strong>${username}:</strong> ${text}`;
        
      if (username === user.name) {
        chatTextLi.classList.add('sent');
      } else {
        chatTextLi.classList.add('received');
      }
  
      messages.appendChild(chatTextLi);
    });

    socket.on("join-room", function (room) { 
      const joinMessageLi = document.createElement('li');
      joinMessageLi.innerText = `You have joined ${room}, say hello!`;
      joinMessageLi.classList.add('sent');
      messages.appendChild(joinMessageLi);
    })
  }
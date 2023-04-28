import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3000");
let user = JSON.parse(localStorage.getItem("user"));

export const socketManagment = () => {
  console.log("hey");
  const messages = document.querySelector(".messages");
  const chatbox = document.querySelector(".chatbox");
  socket.on("room-feedback", function (message) {
    let roomUpdate;
    if (message.startsWith("room1")) {
      roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(1)");
    }
    if (message.startsWith("room2")) {
      roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(2)");
    }
    if (message.startsWith("room3")) {
      roomUpdate = document.querySelector("#roomList .roomCounter:nth-child(3)");
    }
    let messageCapitalize = message.charAt(0).toUpperCase();
    roomUpdate.innerHTML = messageCapitalize + message.slice(1);
  });

  socket.on("typing", (username) => {
    indicateTyping();
  });

  socket.on("stop typing", (username) => {
    isTyping = false;
  });

  socket.on("chat message", function (message) {
    let [username, text] = message.split(": ");
    const chatTextLi = document.createElement("li");
    const time = new Date();
    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedTime = time.toLocaleTimeString("en-US", timeOptions);
    chatTextLi.innerHTML = `<strong>${username} : </strong> ${text}<br> <span>${formattedTime}</span>`;

    if (username === user.name) {
      chatTextLi.classList.add("sent");
    } else if (username.startsWith("[AUTO-GENERATED]")) {
      chatTextLi.classList.add("autoText");
    } else {
      chatTextLi.classList.add("received");
    }
    chatbox.appendChild(messages);
    messages.appendChild(chatTextLi);
  });
};

export const joinRoomSocket = (room, user) => {
  socket.emit("join-room", room, user);
};

export const leaveRoomSocket = (room, user) => {
  socket.emit("leave-room", room, user);
};

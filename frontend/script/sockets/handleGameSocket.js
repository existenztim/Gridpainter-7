import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import { printResults } from "../handleGame";

const socket = io("http://localhost:3000");

export const playerJoinSocket = () => {
  socket.on("onePlayerJoined", () => {
    const gameContainer = document.getElementById("gameContainer");
    const resultMessage = document.getElementById("resultMessage");
    if (resultMessage) {
      resultMessage.remove();
    }
    const message = document.createElement("h3");
    message.id = "playersJoined";
    message.innerText = "One player has joined the game. Waiting for three more players to join!";
    gameContainer.before(message);

    socket.on("twoPlayersJoined", () => {
      const playersJoinedMessage = document.getElementById("playersJoined");
      if (playersJoinedMessage) {
        playersJoinedMessage.remove();
      }
      message.innerText = "Two players have joined the game. Waiting for two more players to join!";
      gameContainer.before(message);
    });

    socket.on("threePlayersJoined", () => {
      const playersJoinedMessage = document.getElementById("playersJoined");
      if (playersJoinedMessage) {
        playersJoinedMessage.remove();
      }
      message.innerText =
        "Three players have joined the game. Waiting for one more player to join!";
      gameContainer.before(message);
    });
  });

  socket.on("fourPlayersJoined", () => {
    const gameContainer = document.getElementById("gameContainer");
    const playersJoinedMessage = document.getElementById("playersJoined");
    if (playersJoinedMessage) {
      playersJoinedMessage.remove();
    }
    const message = document.createElement("h3");
    message.id = "playersJoined";
    message.innerText = "The game has started. Good luck!";
    gameContainer.before(message);
  });

  socket.on("onePlayerHasFinished", () => {
    const gameContainer = document.getElementById("gameContainer");
    const playersJoinedMessage = document.getElementById("playersJoined");
    if (playersJoinedMessage) {
      playersJoinedMessage.remove();
    }
    const message = document.createElement("h3");
    message.id = "playersFinished";
    message.innerText = "One player has finished the game. Click 'End game' when you're ready!";
    gameContainer.before(message);

    socket.on("twoPlayersHaveFinished", () => {
      const playersFinishedMessage = document.getElementById("playersFinished");
      if (playersFinishedMessage) {
        playersFinishedMessage.remove();
      }
      message.innerText = "Two players have finished the game. Click 'End game' when you're ready!";
      gameContainer.before(message);
    });

    socket.on("threePlayersHaveFinished", () => {
      const playersFinishedMessage = document.getElementById("playersFinished");
      if (playersFinishedMessage) {
        playersFinishedMessage.remove();
      }
      message.innerText =
        "Three players have finished the game. Click 'End game' when you're ready!";
      gameContainer.before(message);
    });
  });

  socket.on("fourPlayersHaveFinished", () => {
    const playersFinishedMessage = document.getElementById("playersFinished");
    if (playersFinishedMessage) {
      playersFinishedMessage.remove();
    }
    printResults();
    socket.emit("clearGame");
  });
};

import './style.scss';
//import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import { printLogin } from './script/handleLogin';
import { printChat } from './script/handleChat';
import { printGame } from './script/handleGame';

export function checkLogin() {
  if (localStorage.getItem("user")) {
    printChat();
    printGame();
  } else {
    printLogin();
  }
}
checkLogin();

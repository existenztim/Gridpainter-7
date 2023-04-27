import './style.scss';
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

import './style.scss';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3000');

socket.on('chat', (arg) => {
  console.log('chat', arg);
});

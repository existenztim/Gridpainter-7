import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io('http://localhost:3000');

socket.on('chat', (arg) => {
  console.log('chat', arg);
});

function createGrid() {
    let grid = document.getElementById("grid")

    for(let i=0; i <16; i++){
        let row = document.createElement("tr");
        row.classList.add("tr")

        for(let j=0; j<16; j++){
            let cell = document.createElement("td");
            cell.classList.add("td")

            cell.addEventListener('click', () => {
                console.log(i, j);
                })

            row.appendChild(cell)

        }
        grid.appendChild(row)

        
    }
}

createGrid();


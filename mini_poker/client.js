const socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('open', function (_event) {
    console.log('okets desde cliente')
})
socket.addEventListener('message', function (event) {
    console.log(`Recived: ${event.data}`)
    
    document.getElementById('uid').innerHTML += `<div>Recived: <strong>${event.data}</strong></div>`
})

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    socket.send(JSON.stringify(Object.fromEntries(new FormData(e.target))))
})

document.querySelector('button').addEventListener('click', () => {
    socket.send(JSON.stringify({menu: 'FINISH'}))
})
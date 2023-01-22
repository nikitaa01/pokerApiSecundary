const socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('open', function (_event) {
    console.log('okets desde cliente')
})
socket.addEventListener('message', function (event) {
    console.log(`Recived: ${event.data}`)
    
    document.getElementById('uid').innerHTML += `<p>Recived: <strong>${event.data}</strong></p>`
})

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    socket.send(JSON.stringify(Object.fromEntries(new FormData(e.target))))
})
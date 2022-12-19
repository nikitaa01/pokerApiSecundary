const socket = new WebSocket('ws://localhost:3001')

socket.addEventListener('open', function (_event) {
    console.log('okets desde cliente')
})
socket.addEventListener('message', function (event) {
    console.log(`Recived: ${event.data}`)
    
    const objToString = (obj) => {
        return Object.entries(obj)
            .map(([key, value]) => {
                if (typeof value === 'object') return `${key}:<br>"${objToString(value)}"`
                return `${key}: "${value}"`
            })
            .join(', ')
    }
    
    const obj = JSON.parse(event.data)
    const objMsg = objToString(obj)
    document.getElementById('uid').innerHTML += `<p>Recived: <strong>${objMsg}</strong></p>`
})

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    socket.send(JSON.stringify(Object.fromEntries(new FormData(e.target))))
})
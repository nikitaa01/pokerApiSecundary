const socket = new WebSocket("wss://pixel-poker-api.onrender.com");
let i = 0


socket.addEventListener('open', function (_event) {
    console.log('okets desde cliente')
})
socket.addEventListener('message', function (event) {
    console.log(`Recived: ${event.data}`)
    document.getElementById(
        "uid"
    ).innerHTML += `<pre><code><span>message n: ${++i}</span>\n${event.data}</code></pre>`;
})

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    socket.send(JSON.stringify(Object.fromEntries(new FormData(e.target))))
})

document.querySelector('button').addEventListener('click', () => {
    socket.send(JSON.stringify({menu: 'FINISH'}))
})
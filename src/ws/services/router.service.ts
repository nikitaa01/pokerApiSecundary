import WsClient from "../interfaces/wsClient.interface"

const sendMsg = (status: string, msg?: object) => {
    return JSON.stringify({
        status,
        msg,
    })
}

/* FIXME: msg shoud have type */
const lobbyMsg = (wsClients: WsClient[], status: string, msg?: object) => {
    for (const wsClient of wsClients) {
        wsClient.send(sendMsg(status, msg))
    }
}

const clientMsg = (wsClient: WsClient, status: string, msg?: object) => {
    wsClient.send(sendMsg(status, msg))
}

export { lobbyMsg, clientMsg }
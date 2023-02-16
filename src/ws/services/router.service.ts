import WsClient from "../interfaces/wsClient.interface"

/* FIXME: , null, 2 only in dev */
const sendMsg = (status: string, msg?: object) => {
    return JSON.stringify({
        status,
        ...(Array.isArray(msg) ? { cards: msg } : msg),
    }, null, 2)
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
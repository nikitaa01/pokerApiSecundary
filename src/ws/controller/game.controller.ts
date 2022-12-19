import Lobby from "../interfaces/lobby.interface"
import WsClient from "../interfaces/wsClient.interface"
import Game from "../models/game"
import { clientMsg, lobbyMsg } from "../service/router.service"

const startingGame = (game: Game) => {
    const playersCardObj = game.getPersonalCards()
    for (const msg of playersCardObj) {
        if (!msg) throw new Error('erro')
        clientMsg(msg.wsClient, msg.status, msg.msg)
    }
    const messageQueue = game.getMessageQueue()
    if(!messageQueue) return
    for (const msg of messageQueue) {
        if (!msg) throw new Error('erro')
        lobbyMsg(msg.wsClients, msg.status, msg.msg)
    }
    const waitingCall = game.getNextPlayerWarning()
    clientMsg(waitingCall?.wsClient, waitingCall?.status, waitingCall?.msg)
}

const isExpectedPlayer = ({ uid }: WsClient, lobby: Lobby) => {
    const { game } = lobby
    if (!game) return false
    if (uid != game.getTurnPlayer().uid) return false
    return true
}

export { startingGame, isExpectedPlayer }
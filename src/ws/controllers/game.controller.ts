import Lobby from "../interfaces/lobby.interface"
import WsClient from "../interfaces/wsClient.interface"
import Game from "../models/game"
import { clientMsg, lobbyMsg } from "../services/router.service"

const startingGame = (game: Game) => {
    const dealerPlayer = game.activePlayers[game.activePlayers.length - 1]
    lobbyMsg(game.activePlayers, 'DEALER', { client: dealerPlayer.uid })
    lobbyMsg(game.activePlayers, 'STAGE', { stage: game.getLastRound().getActualStage().name })
    const playersCardObj = game.getPersonalCards()
    if (!playersCardObj) throw new Error("Cards not found")
    
    for (const msg of playersCardObj) {
        if (!msg) throw new Error('erro')
        clientMsg(msg.wsClient, msg.status, msg.msg)
    }
    const messageQueue = game.getTurnPongQueue()
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

//const onBet = ()

export { startingGame, isExpectedPlayer }
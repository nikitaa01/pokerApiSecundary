import Lobby from "../interfaces/lobby.interface"
import WsClient from "../interfaces/wsClient.interface"
import Game from "../models/game"
import Turn from "../models/turn"
import { clientMsg, lobbyMsg } from "../services/router.service"

const nextPlayerMsg = (game: Game) => {
    const waitingCall = game.getNextPlayerWarning()
    if (!waitingCall) return
    clientMsg(waitingCall?.wsClient, waitingCall?.status, waitingCall?.msg)
}

const startingRound = (game: Game) => {
    const dealerPlayer = game.activePlayers[game.activePlayers.length - 1]
    lobbyMsg(game.activePlayers, 'DEALER', { client: dealerPlayer.uid })
    lobbyMsg(game.activePlayers, 'STAGE', { stage: game.getLastRound().getActualStageName() })
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
    nextPlayerMsg(game)

}

const isExpectedPlayer = ({ uid }: WsClient, game: Game) => {
    if (!game) return false
    if (uid != game.getTurnPlayer().uid) return false
    return true
}

const onCall = (player: WsClient, game: Game, msgParsed: any, diference: number) => {
    if (!player.balance) {
        console.log('no hay dineros')
        return
    }
    const newTurn = new Turn(player.uid, 'CALL', msgParsed.amount)
    game.getLastRound().getActualStage().push(newTurn)
    const msg = newTurn.getGroupMsg()
    msg.balance = player.balance - diference
    lobbyMsg(game.activePlayers, 'CALL_DONE', newTurn.getGroupMsg())
    nextPlayerMsg(game)
}

export { startingRound, isExpectedPlayer, onCall }
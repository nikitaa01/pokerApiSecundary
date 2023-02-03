import WsClient from "../interfaces/wsClient.interface"
import Game from "../models/game"
import Turn from "../models/turn"
import { clientMsg, lobbyMsg } from "../services/router.service"

const nextPlayerMsg = (game: Game) => {
    const waitingCall = game.getNextPlayerWarning()
    if (!waitingCall) {
        setNewStage(game)
        return
    }
    clientMsg(waitingCall?.wsClient, waitingCall?.status, waitingCall?.msg)
}

const startingRound = (game: Game) => {
    const dealerPlayer = game.activePlayers[game.activePlayers.length - 1]
    lobbyMsg(game.activePlayers, 'DEALER', { client: dealerPlayer.uid })
    lobbyMsg(game.activePlayers, 'NEW_STAGE', { stage: game.getLastRound().getActualStageName() })
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
        lobbyMsg(msg.wsClients, 'DONE_ACTION', { ...msg.msg, action: msg.status, balance: game.activePlayers.find(p => p.uid == msg.msg.uid)?.balance })
    }
    nextPlayerMsg(game)
}

const setNewStage = (game: Game) => {
    game.resetLastRaised()
    game.getLastRound().setNewStage()
    lobbyMsg(game.activePlayers, 'NEW_STAGE', { stage: game.getLastRound().getActualStageName() })
    lobbyMsg(game.activePlayers, 'COMMON_CARDS', game.getLastRound().getStageCards())
    nextPlayerMsg(game)
}

const isExpectedPlayer = ({ uid }: WsClient, game: Game) => {
    if (!game) return false
    if (uid != game.getTurnPlayer().uid) return false
    return true
}

const onCall = (player: WsClient, game: Game, msgParsed: any, diference: number) => {
    if (!player.balance) {
        return
    }
    const newTurn = new Turn(player.uid, 'CALL', msgParsed.amount)
    game.getLastRound().getActualStage().push(newTurn)
    const msg = newTurn.getGroupMsg()
    player.balance = player.balance - diference
    msg.balance = player.balance - diference
    lobbyMsg(game.activePlayers, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CALL', balance: player.balance })
    nextPlayerMsg(game)
}

const onCheck = (player: WsClient, game: Game) => {
    if (!player.balance) {
        console.log('no hay dineros')
        return
    }
    const newTurn = new Turn(player.uid, 'CHECK')
    const actualStage = game.getLastRound().getActualStage()
    if (actualStage.length == 0) player.lastRaised = true
    actualStage.push(newTurn)
    const msg = newTurn.getGroupMsg()
    lobbyMsg(game.activePlayers, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CHECK', balance: player.balance })
    nextPlayerMsg(game)
}

export { startingRound, setNewStage, isExpectedPlayer, onCall, onCheck }
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
    clientMsg(waitingCall.wsClient, waitingCall.status, waitingCall.msg)
}

const startingRound = (game: Game) => {
    const lastRound = game.getLastRound()
    const players = lastRound.players
    const dealerPlayer = players.at(-1) as WsClient
    lobbyMsg(players, 'DEALER', { client: dealerPlayer.uid })
    lobbyMsg(players, 'NEW_STAGE', { stage: lastRound.getActualStageName() })
    const playersCardObj = game.getPersonalCards()
    if (!playersCardObj) throw new Error("Cards not found")
    for (const msg of playersCardObj) {
        if (!msg) throw new Error('erro')
        clientMsg(msg.wsClient, msg.status, msg.cards)
    }
    const messageQueue = game.getTurnPongQueue()
    if(!messageQueue) return
    for (const msg of messageQueue) {
        if (!msg) throw new Error('erro')
        lobbyMsg(msg.wsClients, 'DONE_ACTION', { ...msg.msg, action: msg.status, balance: players.find(p => p.uid == msg.msg.uid)?.balance, amount: lastRound.amount })
    }
    nextPlayerMsg(game)
}

const setNewStage = (game: Game) => {
    const players = game.getLastRound().players
    game.resetLastRaised()
    game.getLastRound().setNewStage()
    // TODO: mirar combinacion de cartas, y guardar en la base de datos los resultados
    if (game.getLastRound().getActualStageName() == 'river') {
        lobbyMsg(players, 'ROUND_END', { msg: 'WAITING NEW START'})
        return
    }
    lobbyMsg(players, 'NEW_STAGE', { stage: game.getLastRound().getActualStageName() })
    lobbyMsg(players, 'COMMON_CARDS', game.getLastRound().getStageCards())
    nextPlayerMsg(game)
}

const isExpectedPlayer = ({ uid }: WsClient, game: Game) => {
    if (!game) return false
    if (uid != game.getTurnPlayer().uid) return false
    return true
}

const onCall = (player: WsClient, game: Game, diference: number) => {
    if (!player.balance || player.balance < diference) {
        return
    }
    const players = game.getLastRound().players
    const newTurn = new Turn(player.uid, 'CALL', diference)
    const lastRound = game.getLastRound()
    lastRound.getActualStage().push(newTurn)
    lastRound.amount += Number(diference)
    player.balance = player.balance - diference
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CALL', balance: player.balance, amount: lastRound.amount })
    nextPlayerMsg(game)
}

const onCheck = (player: WsClient, game: Game) => {
    if (!player.balance) {
        return
    }
    const lastRound = game.getLastRound()
    const players = lastRound.players
    const newTurn = new Turn(player.uid, 'CHECK')
    const actualStage = lastRound.getActualStage()
    if (actualStage.length == 0) player.lastRaised = true
    actualStage.push(newTurn)
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CHECK', balance: player.balance, amount: lastRound.amount })
    nextPlayerMsg(game)
}

const onRaise = (player: WsClient, msgParsed: any, diference: number, game: Game) => {
    if (!player.balance) {
        return
    }
    if (!msgParsed.amount || diference >= msgParsed.amount) {
        clientMsg(player, 'NOT_DONE_ACTION', { err: 'DIFERENCE IS HIGHER THAN AMOUNT' })
        return
    }
    const lastRound = game.getLastRound()
    const { players } = lastRound
    const newTurn = new Turn(player.uid, 'RAISE', msgParsed.amount)
    game.resetLastRaised()
    player.lastRaised = true
    player.balance -=  Number(msgParsed.amount)
    lastRound.getActualStage().push(newTurn)
    lastRound.amount += msgParsed.amount
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'RAISE', balance: player.balance, amount: lastRound.amount })
    nextPlayerMsg(game)
}

const onBet = (player: WsClient, msgParsed: any, game: Game) => {
    if (!player.balance) {
        return
    }
    if (!msgParsed.amount) {
        clientMsg(player, 'NOT_DONE_ACTION', { err: 'NOT AMOUNT WITH ACTION BET' })
        return
    }
    const lastRound = game.getLastRound()
    const newTurn = new Turn(player.uid, 'BET', msgParsed.amount)
    game.resetLastRaised()
    player.lastRaised = true
    player.balance -= Number(msgParsed.amount)
    lastRound.getActualStage().push(newTurn)
    lastRound.amount += Number(msgParsed.amount)
    lobbyMsg(lastRound.players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'BET', balance: player.balance, amount: lastRound.amount })
    nextPlayerMsg(game)
}

const onFold = (player: WsClient, game: Game) => {
    const newTurn = new Turn(player.uid, 'RAISE')
    const lastRound = game.getLastRound()
    const indexPlayer = lastRound.players.findIndex(({ uid }) => uid == player.uid)
    lobbyMsg(lastRound.players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'FOLD', amount: lastRound.amount })
    lastRound.players.splice(indexPlayer, 1)
    nextPlayerMsg(game)
}

export { startingRound, setNewStage, isExpectedPlayer, onCall, onCheck, onRaise, onBet, onFold }
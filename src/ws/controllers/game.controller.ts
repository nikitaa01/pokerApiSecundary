import Lobby from "../interfaces/lobby.interface"
import WsClient from "../interfaces/wsClient.interface"
import Game from "../models/game"
import Round from "../models/round"
import Turn from "../models/turn"
import { clientMsg, lobbyMsg } from "../services/router.service"

const nextPlayerMsg = (game: Game) => {
    const waitingCall = game.getNextPlayerWarning()
    if (waitingCall?.msg.balance == 0) {
        const turnPlayer = game.getTurnPlayer()
        turnPlayer.close()
        lobbyMsg(game.getLastRound().players, 'LOSE', { uid: turnPlayer.uid })
    }
    if (!waitingCall) {
        setNewStage(game)
        return
    }
    clientMsg(waitingCall.wsClient, waitingCall.status, waitingCall.msg)
}

const startingRound = (game: Game) => {
    const lastRound = game.getLastRound()
    console.log('starting round', lastRound.players.length)
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
    if (!messageQueue) return
    for (const msg of messageQueue) {
        if (!msg) throw new Error('erro')
        lobbyMsg(msg.wsClients, 'DONE_ACTION', { ...msg.msg, action: msg.status, balance: players.find(p => p.uid == msg.msg.uid)?.balance, tableAmount: lastRound.amount })
    }
    nextPlayerMsg(game)
}

const setNewStage = (game: Game) => {
    const lastRound = game.getLastRound()
    const players = lastRound.players
    game.resetLastRaised()
    lastRound.setNewStage()
    // TODO: guardar en la base de datos los resultados
    if (lastRound.getActualStageName() == 'river') {
        const winnerRes = lastRound.getWinner()
        const eachWinnerProffit = lastRound.amount / winnerRes.winners.length
        game.activePlayers = game.activePlayers.map(p => {
            if (winnerRes.winners.includes(p.uid)) {
                p.balance = (p.balance ?? 0) + eachWinnerProffit
            }
            return p
        })
        lobbyMsg(game.getLastRound().players, 'FINISH', {
            winners: winnerRes.winners.map(winner => ({
                uid: winner,
                proffit: eachWinnerProffit,
            })),
            combinations: winnerRes.combinations,
        })
        return
    }
    lobbyMsg(players, 'NEW_STAGE', { stage: lastRound.getActualStageName() })
    lobbyMsg(players, 'COMMON_CARDS', lastRound.getStageCards())
    nextPlayerMsg(game)
}

const isExpectedPlayer = ({ uid }: WsClient, game: Game) => {
    if (!game) return false
    if (uid != game.getTurnPlayer().uid) return false
    return true
}

const getMaxAmount = (lastRound: Round, diference: number) => {
    const lowerPlayerBalance = lastRound.getLowerPlayerBalance()
    const lowerPlayerDiference = lastRound.getHighestPersAmount() - lastRound.getPersAmount(lowerPlayerBalance.uid)
    return (lowerPlayerBalance.balance ?? 0 - lowerPlayerDiference) + diference
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
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CALL', balance: player.balance, tableAmount: lastRound.amount })
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
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'CHECK', balance: player.balance, tableAmount: lastRound.amount })
    nextPlayerMsg(game)
}

const onRaise = (player: WsClient, msgParsed: any, diference: number, game: Game) => {
    if (!player.balance) {
        return
    }
    const lastRound = game.getLastRound()
    const maxAmount = getMaxAmount(lastRound, diference)
    if (!msgParsed.amount || diference >= msgParsed.amount || Number(player.balance) < Number(msgParsed.amount) || Number(maxAmount) < Number(msgParsed.amount)) {
        clientMsg(player, 'NOT_DONE_ACTION', { err: 'DIFERENCE IS HIGHER THAN AMOUNT' })
        return
    }
    const { players } = lastRound
    const newTurn = new Turn(player.uid, 'RAISE', Number(msgParsed.amount))
    game.resetLastRaised()
    player.lastRaised = true
    player.balance -= Number(msgParsed.amount)
    lastRound.getActualStage().push(newTurn)
    lastRound.amount += Number(msgParsed.amount)
    lobbyMsg(players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'RAISE', playerAmount: Number(msgParsed.amount), balance: player.balance, tableAmount: lastRound.amount })
    nextPlayerMsg(game)
}

const onBet = (player: WsClient, msgParsed: any, game: Game) => {
    if (!player.balance) {
        return
    }
    const lastRound = game.getLastRound()
    const maxAmount = getMaxAmount(lastRound, 0)
    if (!msgParsed.amount || Number(player.balance) < Number(msgParsed.amount) || Number(maxAmount) < Number(msgParsed.amount)) {
        clientMsg(player, 'NOT_DONE_ACTION', { err: 'NOT AMOUNT WITH ACTION BET' })
        return
    }
    const newTurn = new Turn(player.uid, 'BET', Number(msgParsed.amount))
    game.resetLastRaised()
    player.lastRaised = true
    player.balance -= Number(msgParsed.amount)
    lastRound.getActualStage().push(newTurn)
    lastRound.amount += Number(msgParsed.amount)
    lobbyMsg(lastRound.players, 'DONE_ACTION',
        { ...newTurn.getGroupMsg(), action: 'BET', playerAmount: Number(msgParsed.amount), balance: player.balance, tableAmount: lastRound.amount })
    nextPlayerMsg(game)
}

// FIXME: Arreglar el unfold para que cuando sea nueva ronda pueda volver a participar el que se ha hecho fold
const onFold = (player: WsClient, game: Game) => {
    const newTurn = new Turn(player.uid, 'RAISE')
    const lastRound = game.getLastRound()
    const indexPlayer = lastRound.players.findIndex(({ uid }) => uid == player.uid)
    lobbyMsg(lastRound.players, 'DONE_ACTION', { ...newTurn.getGroupMsg(), action: 'FOLD', tableAmount: lastRound.amount })
    lastRound.players.splice(indexPlayer, 1)
    nextPlayerMsg(game)
}

const onExitGame = (player: WsClient, lobby: Lobby) => {
    const game = lobby.game
    if (!game) return
    const lastRound = game.getLastRound()
    lastRound.amount += Number(player.balance) ?? 0
    game.activePlayers = game.activePlayers.filter(p => p.uid != player.uid)
    lastRound.players = lastRound.players.filter(p => p.uid != player.uid)
    /* FIXME: msg provisional, hay que arrgelarlo */
    lobbyMsg(lastRound.players, 'EXITEDE_GAME', { uid: player.uid, tableAmount: lastRound.amount })
    if (game.checkIfGameEnd()) {
        /* TODO: guardar en la base de datos el nuevo balance del jugador */
        const getWinner = lastRound.getWinner()
        const winner = getWinner.winners[0]
        const player = game.activePlayers.find(p => p.uid == winner)
        if (!player || !player.balance) return
        clientMsg(player, 'GAME_END', { reward: Number(player.balance) + Number(lastRound.amount) })
        player.close()
    }
    nextPlayerMsg(game)
}

export { startingRound, setNewStage, isExpectedPlayer, onCall, onCheck, onRaise, onBet, onFold, onExitGame }
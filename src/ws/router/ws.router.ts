import { RawData } from 'ws'
import Lobby from '../interfaces/lobby.interface'
import Msg from '../interfaces/msg.interface'
import WsClient from '../interfaces/wsClient.interface'
import { onConnect, onCreate, onExit, onJoin, onStart, onDefault } from '../controllers/wsEvents.controller'
import { isExpectedPlayer, onCall, onCheck, onRaise, onFold, onBet } from '../controllers/game.controller'
import Game from '../models/game'

const lobbies: Lobby[] = []

/**
 * Forward the menu options, to create, join and etc...
 * @param msgParsed 
 * @param wsClient 
 * @param lobby 
 */
const menu = (msgParsed: Msg, wsClient: WsClient, lobby: Lobby | undefined) => {
    switch (msgParsed.menu) {
    case 'CREATE':
        if (lobby) return onDefault(wsClient)
        msgParsed.reward && onCreate(lobbies, wsClient, msgParsed.reward)
        break
    case 'JOIN':
        if (lobby) return onDefault(wsClient)
        msgParsed.gid && onJoin(lobbies, wsClient, msgParsed.gid)
        break
    case 'START': // TODO: si solo hay 1 persona no se puede empezar
        if (lobby?.game) return onDefault(wsClient)
        lobby && onStart(lobby)
        break
    case 'EXIT':
        onExit(wsClient, lobbies)
        break
    case 'IN_GAME':
        if (!lobby?.game) throw new Error('No lobby in game')
        if (!isExpectedPlayer(wsClient, lobby.game)) return
        inGameMenu(msgParsed, wsClient, lobby.game)
        break
    default:
        onDefault(wsClient)
        console.log('error')
        break
    }
}

const inGameMenu = (msgParsed: Msg, wsClient: WsClient, game: Game) => {
    const lastRound = game.getLastRound()
    const player = lastRound.players.find(player => player.uid == wsClient.uid)
    const { turnAction } = msgParsed
    if (!turnAction || !player) return
    if (player.lastRaised === undefined) throw new Error("getNextPlayerWarning func no last raised atribute")
    const wsClientPotentialActions = lastRound.getPotentialActions(player.uid, player.lastRaised)
    if (!wsClientPotentialActions) {
        return
    }
    if (!wsClientPotentialActions.actions.includes(turnAction)) return
    switch (turnAction) {
    case 'BET':
        onBet(player, msgParsed, game)
        return
    case 'CALL':
        if (!wsClientPotentialActions.diference) throw new Error("Error not diference and potential action call")
        onCall(player, game, wsClientPotentialActions.diference)
        break
    case 'CHECK':
        onCheck(player, game)
        break
    case 'RAISE':
        if (!wsClientPotentialActions.diference) throw new Error("Error not diference and potential action raise")
        onRaise(player, msgParsed, wsClientPotentialActions.diference, game)
        break
    case 'FOLD':
        onFold(player, game)
        break
    }
}

/**
 * This method is used to forward incoming messages.
 * @param wsClient the user that triggers the events.
 */
const router = (wsClient: WsClient) => {
    onConnect(wsClient)
    wsClient.on('message', (msg: RawData) => {
        const lobby = lobbies.find(({ gid }) => gid == wsClient.gid)
        const msgParsed = JSON.parse(msg.toString()) as Msg
        menu(msgParsed, wsClient, lobby)
    })

    wsClient.on('error', () => {
        onExit(wsClient, lobbies)
    })

    wsClient.on('close', () => {
        onExit(wsClient, lobbies)
    })
}

export default router
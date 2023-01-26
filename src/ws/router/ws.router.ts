import { RawData } from 'ws'
import Lobby from '../interfaces/lobby.interface'
import Msg from '../interfaces/msg.interface'
import WsClient from '../interfaces/wsClient.interface'
import { onConnect, onCreate, onExit, onJoin, onStart, onDefault } from '../controllers/wsEvents.controller'
import { isExpectedPlayer, onCall } from '../controllers/game.controller'
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
        !msgParsed.reward || onCreate(lobbies, wsClient, msgParsed.reward)
        break
    case 'JOIN':
        !msgParsed.gid || onJoin(lobbies, wsClient, msgParsed.gid)
        break
    case 'START':
        !lobby || onStart(lobby)
        break
    case 'EXIT':
        onExit(wsClient, lobbies)
        break
    case 'IN_GAME':
        if (!lobby?.game) throw new Error('No lobby in game')
        if (!isExpectedPlayer(wsClient, lobby.game)) return
        inGameMenu(msgParsed, wsClient, lobby.game)
        break;
    default:
        onDefault(wsClient)
        console.log('error')
        break
    }
}

const inGameMenu = (msgParsed: Msg, wsClient: WsClient, game: Game) => {
    const player = game.activePlayers.find(player => player.uid == wsClient.uid)
    const { turnAction } = msgParsed
    if (!turnAction || !player) return
    if (player.lastRaised === undefined) throw new Error("getNextPlayerWarning func no last raised atribute");
    const wsClientPotentialActions = game.getLastRound().getPotentialActions(player.uid, player.lastRaised)
    if (!wsClientPotentialActions) return
    if (!wsClientPotentialActions.actions.includes(turnAction)) return
    switch (turnAction) {
    case 'BET':
        break
    case 'CALL':
        if (!wsClientPotentialActions.diference) throw new Error("Error not diference and potential action call");
        onCall(player, game, msgParsed, wsClientPotentialActions.diference)
        break
    case 'CHECK':
        break
    case 'RAISE':
        break
    case 'FOLD':
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
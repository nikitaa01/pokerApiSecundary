import { RawData } from 'ws'
import Lobby from '../interfaces/lobby.interface'
import Msg from '../interfaces/msg.interface'
import WsClient from '../interfaces/wsClient.interface'
import { onConnect, onCreate, onExit, onJoin, onStart } from '../controller/wsEvents.controller'
import { isExpectedPlayer } from '../controller/game.controller'
import Game from '../models/game'

const lobbies: Lobby[] = []

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
    default:
        console.log('error')
        break
    }
}

const inGameMenu = (msgParsed: Msg, wsClient: WsClient, game: Game) => {
    const { turnAction } = msgParsed
    if (!turnAction) return
    if (!game.getLastRound().getPotentialActions().includes(turnAction)) return
    switch (turnAction) {
    case 'BET':
        break
    case 'CALL':
        break
    case 'CHECK':
        break
    case 'RAISE':
        break
    case 'FOLD':
        break
    }
}

const router = (wsClient: WsClient) => {
    onConnect(wsClient)
    wsClient.on('message', (msg: RawData) => {
        const lobby = lobbies.find(({ gid }) => gid == wsClient.gid)
        const msgParsed = JSON.parse(msg.toString()) as Msg
        menu(msgParsed, wsClient, lobby)
        if (!lobby?.game || !lobby || !isExpectedPlayer(wsClient, lobby)) {
            return
        }
        inGameMenu
    })

    wsClient.on('error', () => {
        onExit(wsClient, lobbies)
    })

    wsClient.on('close', () => {
        onExit(wsClient, lobbies)
    })
}

export default router
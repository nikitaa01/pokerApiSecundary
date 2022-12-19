import Lobby from '../interfaces/lobby.interface'
import WsClient from '../interfaces/wsClient.interface'
import gidGenerator from '../utils/generateGid'
import { clientMsg, lobbyMsg } from '../service/router.service'
import getWsClientsUids from '../utils/getWsClientsUid'
import Game from '../models/game'
import { startingGame } from './game.controller'

/* FIXME: uid should be fetched  */
const onConnect = (wsClient: WsClient) => {
    const uid = gidGenerator(3)
    wsClient.uid = uid
    clientMsg(wsClient, 'CONNECTED', { client: uid })
}

const onCreate = (lobbies: Lobby[], wsClient: WsClient, reward: number) => {
    const gid = gidGenerator()
    lobbies.push({ gid, wsClients: [wsClient], reward})
    wsClient.gid = gid
    clientMsg(wsClient, 'CREATED', { lobby: gid })
}

const onJoin = (lobbies: Lobby[], wsClient: WsClient, gidParam: string) => {
    const lobby = lobbies.find(({ gid }) => gid == gidParam)
    if (lobby == undefined) {
        clientMsg(wsClient, 'LOBBY_NOT_FOUND', {
            gid: gidParam
        })
        return
    }
    const { gid, wsClients } = lobby
    wsClient.gid = gid
    wsClients.push(wsClient)
    const wsClientsUids = getWsClientsUids(wsClients)
    const { uid } = wsClient 
    lobbyMsg(wsClients, 'JOINED', {
        clients: wsClientsUids,
        client: uid,
    })
}

const onStart = (lobby: Lobby) => {
    const { wsClients } = lobby
    const wsClientsUids = getWsClientsUids(wsClients)
    lobbyMsg(wsClients, 'STARTED', { round: 'preflop', clients: wsClientsUids })
    lobby.game = new Game(wsClients, 0.5)
    startingGame(lobby.game)
}

const onExit = (wsClient: WsClient, lobbies: Lobby[]) => {
    const lobby = lobbies.find(({ gid }) => gid == wsClient.gid)
    if (lobby == undefined) return
    const { wsClients } = lobby
    const wsClientI = wsClients.findIndex(({ uid }) => uid == wsClient.uid)
    if (wsClientI == -1) return
    if (wsClients.length == 1) {
        lobbies.splice(lobbies.indexOf(lobby), 1)
        return
    }
    const { uid: client } = wsClients[wsClientI]
    wsClients.splice(wsClientI, 1)
    const wsClientsUids = getWsClientsUids(wsClients)
    lobbyMsg(wsClients, 'EXITED', { clients: wsClientsUids, client })
}

export { onConnect, onCreate, onJoin, onStart, onExit }
import Lobby from '../interfaces/lobby.interface'
import WsClient from '../interfaces/wsClient.interface'
import gidGenerator from '../utils/generateGid'
import { clientMsg, lobbyMsg } from '../services/router.service'
import getWsClientsUids from '../utils/getWsClientsUid'
import Game from '../models/game'
import { startingRound } from './game.controller'

/* FIXME: uid should be fetched  */
const onConnect = (wsClient: WsClient) => {
    const uid = gidGenerator(3)
    wsClient.uid = uid
    clientMsg(wsClient, 'CONNECTED', { client: uid })
}

/**
 * This method is used to create a lobby and add it to the lobbies array, it also notifies the user that it has been created.
 * @param lobbies 
 * @param wsClient 
 * @param reward 
 */
const onCreate = (lobbies: Lobby[], wsClient: WsClient, reward: number) => {
    const gid = gidGenerator()
    lobbies.push({ gid, wsClients: [wsClient], reward})
    wsClient.gid = gid
    clientMsg(wsClient, 'CREATED', { lobby: gid })
}

/**
 * This method is used to join to a lobby by the lobby id, it also notifies the entire lobby of a user joined.
 * @param lobbies 
 * @param wsClient 
 * @param gidParam 
 */
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
    lobbyMsg(wsClients, 'STARTED')
    if (!lobby.game) {
        lobby.game = new Game(wsClients, lobby.reward)
    } else {
        if (lobby.game.getLastRound().getActualStageName() != 'river') return
        lobby.game.setNewRound()
    }
    startingRound(lobby.game)
}

const onDefault = (wsClient: WsClient) => {
    clientMsg(wsClient, 'NOT_FOUND', {
        error: "menu atribute not found or menu value is undefined"
    })
}

const onExit = (wsClient: WsClient, lobbies: Lobby[], lobby: Lobby) => {
    const { wsClients } = lobby
    const wsClientI = wsClients.findIndex(({ uid }) => uid == wsClient.uid)
    if (wsClientI == -1) return
    const { uid: client } = wsClients[wsClientI]
    wsClients.splice(wsClientI, 1)
    if (wsClients.length == 0) {
        lobbies.splice(lobbies.indexOf(lobby), 1)
        return
    }
    const wsClientsUids = getWsClientsUids(wsClients)
    lobbyMsg(wsClients, 'EXITED', { clients: wsClientsUids, client })
}

export { onConnect, onCreate, onJoin, onStart, onDefault, onExit }
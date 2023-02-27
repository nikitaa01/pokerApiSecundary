"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onExit = exports.onDefault = exports.onStart = exports.onJoin = exports.onCreate = exports.onConnect = void 0;
const generateGid_1 = __importDefault(require("../utils/generateGid"));
const router_service_1 = require("../services/router.service");
const getWsClientsUid_1 = __importDefault(require("../utils/getWsClientsUid"));
const game_1 = __importDefault(require("../models/game"));
const game_controller_1 = require("./game.controller");
/* FIXME: uid should be fetched  */
const onConnect = (wsClient) => {
    const uid = (0, generateGid_1.default)(3);
    wsClient.uid = uid;
    (0, router_service_1.clientMsg)(wsClient, 'CONNECTED', { client: uid });
};
exports.onConnect = onConnect;
/**
 * This method is used to create a lobby and add it to the lobbies array, it also notifies the user that it has been created.
 * @param lobbies
 * @param wsClient
 * @param reward
 */
const onCreate = (lobbies, wsClient, reward) => {
    const gid = (0, generateGid_1.default)();
    lobbies.push({ gid, wsClients: [wsClient], reward });
    wsClient.gid = gid;
    (0, router_service_1.clientMsg)(wsClient, 'CREATED', { lobby: gid });
};
exports.onCreate = onCreate;
/**
 * This method is used to join to a lobby by the lobby id, it also notifies the entire lobby of a user joined.
 * @param lobbies
 * @param wsClient
 * @param gidParam
 */
const onJoin = (lobbies, wsClient, gidParam) => {
    const lobby = lobbies.find(({ gid }) => gid == gidParam);
    if (lobby == undefined) {
        (0, router_service_1.clientMsg)(wsClient, 'LOBBY_NOT_FOUND', {
            gid: gidParam
        });
        return;
    }
    const { gid, wsClients } = lobby;
    wsClient.gid = gid;
    wsClients.push(wsClient);
    const wsClientsUids = (0, getWsClientsUid_1.default)(wsClients);
    const { uid } = wsClient;
    (0, router_service_1.lobbyMsg)(wsClients, 'JOINED', {
        clients: wsClientsUids,
        client: uid,
    });
};
exports.onJoin = onJoin;
const onStart = (lobby) => {
    const { wsClients } = lobby;
    (0, router_service_1.lobbyMsg)(wsClients, 'STARTED');
    if (!lobby.game) {
        lobby.game = new game_1.default(wsClients, lobby.reward);
    }
    else {
        if (lobby.game.getLastRound().getActualStageName() != 'river')
            return;
        lobby.game.setNewRound();
    }
    (0, game_controller_1.startingRound)(lobby.game);
};
exports.onStart = onStart;
const onDefault = (wsClient) => {
    (0, router_service_1.clientMsg)(wsClient, 'NOT_FOUND', {
        error: "menu atribute not found or menu value is undefined"
    });
};
exports.onDefault = onDefault;
const onExit = (wsClient, lobbies, lobby) => {
    const { wsClients } = lobby;
    const wsClientI = wsClients.findIndex(({ uid }) => uid == wsClient.uid);
    if (wsClientI == -1)
        return;
    const { uid: client } = wsClients[wsClientI];
    wsClients.splice(wsClientI, 1);
    if (wsClients.length == 0) {
        lobbies.splice(lobbies.indexOf(lobby), 1);
        return;
    }
    const wsClientsUids = (0, getWsClientsUid_1.default)(wsClients);
    (0, router_service_1.lobbyMsg)(wsClients, 'EXITED', { clients: wsClientsUids, client });
};
exports.onExit = onExit;

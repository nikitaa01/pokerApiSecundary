"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onExitGame = exports.onFold = exports.onBet = exports.onRaise = exports.onCheck = exports.onCall = exports.isExpectedPlayer = exports.setNewStage = exports.startingRound = void 0;
const turn_1 = __importDefault(require("../models/turn"));
const router_service_1 = require("../services/router.service");
const nextPlayerMsg = (game) => {
    const waitingCall = game.getNextPlayerWarning();
    if ((waitingCall === null || waitingCall === void 0 ? void 0 : waitingCall.msg.balance) == 0) {
        const turnPlayer = game.getTurnPlayer();
        turnPlayer.close();
        (0, router_service_1.lobbyMsg)(game.getLastRound().players, 'LOSE', { uid: turnPlayer.uid });
    }
    if (!waitingCall) {
        setNewStage(game);
        return;
    }
    (0, router_service_1.clientMsg)(waitingCall.wsClient, waitingCall.status, waitingCall.msg);
};
const startingRound = (game) => {
    var _a;
    const lastRound = game.getLastRound();
    console.log('starting round', lastRound.players.length);
    const players = lastRound.players;
    const dealerPlayer = players.at(-1);
    (0, router_service_1.lobbyMsg)(players, 'DEALER', { client: dealerPlayer.uid });
    (0, router_service_1.lobbyMsg)(players, 'NEW_STAGE', { stage: lastRound.getActualStageName() });
    const playersCardObj = game.getPersonalCards();
    if (!playersCardObj)
        throw new Error("Cards not found");
    for (const msg of playersCardObj) {
        if (!msg)
            throw new Error('erro');
        (0, router_service_1.clientMsg)(msg.wsClient, msg.status, msg.cards);
    }
    const messageQueue = game.getTurnPongQueue();
    if (!messageQueue)
        return;
    for (const msg of messageQueue) {
        if (!msg)
            throw new Error('erro');
        (0, router_service_1.lobbyMsg)(msg.wsClients, 'DONE_ACTION', Object.assign(Object.assign({}, msg.msg), { action: msg.status, balance: (_a = players.find(p => p.uid == msg.msg.uid)) === null || _a === void 0 ? void 0 : _a.balance, tableAmount: lastRound.amount }));
    }
    nextPlayerMsg(game);
};
exports.startingRound = startingRound;
const setNewStage = (game) => {
    const lastRound = game.getLastRound();
    const players = lastRound.players;
    game.resetLastRaised();
    lastRound.setNewStage();
    // TODO: guardar en la base de datos los resultados
    if (lastRound.getActualStageName() == 'river') {
        const winnerRes = lastRound.getWinner();
        const eachWinnerProffit = lastRound.amount / winnerRes.winners.length;
        game.activePlayers = game.activePlayers.map(p => {
            var _a;
            if (winnerRes.winners.includes(p.uid)) {
                p.balance = ((_a = p.balance) !== null && _a !== void 0 ? _a : 0) + eachWinnerProffit;
            }
            return p;
        });
        (0, router_service_1.lobbyMsg)(game.getLastRound().players, 'FINISH', {
            winners: winnerRes.winners.map(winner => ({
                uid: winner,
                proffit: eachWinnerProffit,
            })),
            combinations: winnerRes.combinations,
        });
        return;
    }
    (0, router_service_1.lobbyMsg)(players, 'NEW_STAGE', { stage: lastRound.getActualStageName() });
    (0, router_service_1.lobbyMsg)(players, 'COMMON_CARDS', lastRound.getStageCards());
    nextPlayerMsg(game);
};
exports.setNewStage = setNewStage;
const isExpectedPlayer = ({ uid }, game) => {
    if (!game)
        return false;
    if (uid != game.getTurnPlayer().uid)
        return false;
    return true;
};
exports.isExpectedPlayer = isExpectedPlayer;
const getMaxAmount = (lastRound, diference) => {
    var _a;
    const lowerPlayerBalance = lastRound.getLowerPlayerBalance();
    const lowerPlayerDiference = lastRound.getHighestPersAmount() - lastRound.getPersAmount(lowerPlayerBalance.uid);
    return ((_a = lowerPlayerBalance.balance) !== null && _a !== void 0 ? _a : 0 - lowerPlayerDiference) + diference;
};
const onCall = (player, game, diference) => {
    if (!player.balance || player.balance < diference) {
        return;
    }
    const players = game.getLastRound().players;
    const newTurn = new turn_1.default(player.uid, 'CALL', diference);
    const lastRound = game.getLastRound();
    lastRound.getActualStage().push(newTurn);
    lastRound.amount += Number(diference);
    player.balance = player.balance - diference;
    (0, router_service_1.lobbyMsg)(players, 'DONE_ACTION', Object.assign(Object.assign({}, newTurn.getGroupMsg()), { action: 'CALL', balance: player.balance, tableAmount: lastRound.amount }));
    nextPlayerMsg(game);
};
exports.onCall = onCall;
const onCheck = (player, game) => {
    if (!player.balance) {
        return;
    }
    const lastRound = game.getLastRound();
    const players = lastRound.players;
    const newTurn = new turn_1.default(player.uid, 'CHECK');
    const actualStage = lastRound.getActualStage();
    if (actualStage.length == 0)
        player.lastRaised = true;
    actualStage.push(newTurn);
    (0, router_service_1.lobbyMsg)(players, 'DONE_ACTION', Object.assign(Object.assign({}, newTurn.getGroupMsg()), { action: 'CHECK', balance: player.balance, tableAmount: lastRound.amount }));
    nextPlayerMsg(game);
};
exports.onCheck = onCheck;
const onRaise = (player, msgParsed, diference, game) => {
    if (!player.balance) {
        return;
    }
    const lastRound = game.getLastRound();
    const maxAmount = getMaxAmount(lastRound, diference);
    if (!msgParsed.amount || diference >= msgParsed.amount || Number(player.balance) < Number(msgParsed.amount) || Number(maxAmount) < Number(msgParsed.amount)) {
        (0, router_service_1.clientMsg)(player, 'NOT_DONE_ACTION', { err: 'DIFERENCE IS HIGHER THAN AMOUNT' });
        return;
    }
    const { players } = lastRound;
    const newTurn = new turn_1.default(player.uid, 'RAISE', Number(msgParsed.amount));
    game.resetLastRaised();
    player.lastRaised = true;
    player.balance -= Number(msgParsed.amount);
    lastRound.getActualStage().push(newTurn);
    lastRound.amount += Number(msgParsed.amount);
    (0, router_service_1.lobbyMsg)(players, 'DONE_ACTION', Object.assign(Object.assign({}, newTurn.getGroupMsg()), { action: 'RAISE', playerAmount: Number(msgParsed.amount), balance: player.balance, tableAmount: lastRound.amount }));
    nextPlayerMsg(game);
};
exports.onRaise = onRaise;
const onBet = (player, msgParsed, game) => {
    if (!player.balance) {
        return;
    }
    const lastRound = game.getLastRound();
    const maxAmount = getMaxAmount(lastRound, 0);
    if (!msgParsed.amount || Number(player.balance) < Number(msgParsed.amount) || Number(maxAmount) < Number(msgParsed.amount)) {
        (0, router_service_1.clientMsg)(player, 'NOT_DONE_ACTION', { err: 'NOT AMOUNT WITH ACTION BET' });
        return;
    }
    const newTurn = new turn_1.default(player.uid, 'BET', Number(msgParsed.amount));
    game.resetLastRaised();
    player.lastRaised = true;
    player.balance -= Number(msgParsed.amount);
    lastRound.getActualStage().push(newTurn);
    lastRound.amount += Number(msgParsed.amount);
    (0, router_service_1.lobbyMsg)(lastRound.players, 'DONE_ACTION', Object.assign(Object.assign({}, newTurn.getGroupMsg()), { action: 'BET', playerAmount: Number(msgParsed.amount), balance: player.balance, tableAmount: lastRound.amount }));
    nextPlayerMsg(game);
};
exports.onBet = onBet;
// FIXME: Arreglar el unfold para que cuando sea nueva ronda pueda volver a participar el que se ha hecho fold
const onFold = (player, game) => {
    const newTurn = new turn_1.default(player.uid, 'RAISE');
    const lastRound = game.getLastRound();
    const indexPlayer = lastRound.players.findIndex(({ uid }) => uid == player.uid);
    (0, router_service_1.lobbyMsg)(lastRound.players, 'DONE_ACTION', Object.assign(Object.assign({}, newTurn.getGroupMsg()), { action: 'FOLD', tableAmount: lastRound.amount }));
    lastRound.players.splice(indexPlayer, 1);
    nextPlayerMsg(game);
};
exports.onFold = onFold;
const onExitGame = (player, lobby) => {
    var _a;
    const game = lobby.game;
    if (!game)
        return;
    const lastRound = game.getLastRound();
    lastRound.amount += (_a = Number(player.balance)) !== null && _a !== void 0 ? _a : 0;
    game.activePlayers = game.activePlayers.filter(p => p.uid != player.uid);
    lastRound.players = lastRound.players.filter(p => p.uid != player.uid);
    /* FIXME: msg provisional, hay que arrgelarlo */
    (0, router_service_1.lobbyMsg)(lastRound.players, 'EXITEDE_GAME', { uid: player.uid, tableAmount: lastRound.amount });
    if (game.checkIfGameEnd()) {
        /* TODO: guardar en la base de datos el nuevo balance del jugador */
        const getWinner = lastRound.getWinner();
        const winner = getWinner.winners[0];
        const player = game.activePlayers.find(p => p.uid == winner);
        if (!player || !player.balance)
            return;
        (0, router_service_1.clientMsg)(player, 'GAME_END', { reward: Number(player.balance) + Number(lastRound.amount) });
        player.close();
    }
    nextPlayerMsg(game);
};
exports.onExitGame = onExitGame;

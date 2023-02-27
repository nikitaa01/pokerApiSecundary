"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getWsClientsUid_1 = __importDefault(require("../utils/getWsClientsUid"));
const round_1 = __importDefault(require("./round"));
const turn_1 = __importDefault(require("./turn"));
class Game {
    constructor(activePlayers, reward) {
        const persBalance = reward;
        const smallBlind = Math.trunc(persBalance / 20);
        this.activePlayers = activePlayers.map(player => {
            player.lastRaised = false;
            player.balance = persBalance;
            return player;
        });
        this.smallBlind = smallBlind;
        this.bigBlind = smallBlind * 2;
        this.rounds = [this.getNewRound()];
    }
    getNewRound() {
        const dealer = this.activePlayers.shift();
        if (!dealer)
            throw new Error('Game players array is empty');
        this.activePlayers.push(dealer);
        const players = [this.getTurnPlayer(this.activePlayers, 0), this.getTurnPlayer(this.activePlayers, 1)];
        players[0].balance = players[0].balance - this.smallBlind;
        players[1].balance = players[1].balance - this.bigBlind;
        players[1].lastRaised = true;
        const round = new round_1.default([
            new turn_1.default(players[0].uid, 'BET', this.smallBlind),
            new turn_1.default(players[1].uid, 'RAISE', this.bigBlind),
        ], this.activePlayers, (this.smallBlind + this.bigBlind));
        return round;
    }
    setNewRound() {
        this.rounds.push(this.getNewRound());
    }
    resetLastRaised() {
        this.getLastRound().players = this.getLastRound().players.map(player => {
            player.lastRaised = false;
            return player;
        });
    }
    getLastRound() {
        return this.rounds[this.rounds.length - 1];
    }
    getTurnPong(turn) {
        const players = this.getLastRound().players;
        const player = players.find((wsClient) => wsClient.uid == turn.playerUid);
        if (!player)
            return;
        if (turn.amount && player.balance)
            player.balance - turn.amount;
        turn.sendedPong = true;
        return { wsClients: players, status: turn.action, msg: turn.getGroupMsg() };
    }
    getTurnPongQueue() {
        const pongQueue = [];
        const noPongTurns = this.getLastRound().getActualStage().filter(({ sendedPong }) => !sendedPong);
        for (const turn of noPongTurns) {
            const msg = this.getTurnPong(turn);
            if (!msg)
                return;
            pongQueue.push(msg);
        }
        return pongQueue;
    }
    getNextPlayerWarning() {
        var _a;
        const turnPlayer = this.getTurnPlayer();
        if ((turnPlayer === null || turnPlayer === void 0 ? void 0 : turnPlayer.lastRaised) === undefined)
            return;
        const msg = this.getLastRound().getPotentialActions(turnPlayer.uid, turnPlayer.lastRaised);
        if (!msg)
            return;
        /* TODO: refractorizar como sacar el lowerPlayerBalance */
        const lastRound = this.getLastRound();
        const lowerPlayerBalance = lastRound.getLowerPlayerBalance();
        const lowerPlayerDiference = lastRound.getHighestPersAmount() - lastRound.getPersAmount(lowerPlayerBalance.uid);
        const maxAmount = ((_a = lowerPlayerBalance.balance) !== null && _a !== void 0 ? _a : 0 - lowerPlayerDiference) + lastRound.getHighestPersAmount() - lastRound.getPersAmount(turnPlayer.uid);
        return {
            wsClient: turnPlayer, status: 'WAITING', msg: Object.assign(Object.assign({}, msg), { maxAmount, balance: turnPlayer.balance }),
        };
    }
    getPersonalCards() {
        const allCards = this.getLastRound().roundDeck;
        const cardsToSend = [];
        for (const player of this.getLastRound().players) {
            const cards = [allCards.pop(), allCards.pop()];
            if (cards.includes(undefined))
                return;
            player.cards = cards;
            cardsToSend.push({ wsClient: player, status: 'PERS_CARDS', cards });
        }
        return cardsToSend;
    }
    getTurnPlayer(players = this.getLastRound().players, numTurns = -1) {
        let numTurnsReturn = numTurns;
        if (numTurnsReturn == -1) {
            const playersUids = (0, getWsClientsUid_1.default)(players);
            numTurnsReturn = this.getLastRound().getActualStage()
                .filter(({ playerUid }) => playersUids.includes(playerUid))
                .length;
        }
        return players[numTurnsReturn % players.length];
    }
    checkIfGameEnd() {
        return this.activePlayers.length == 1;
    }
}
exports.default = Game;

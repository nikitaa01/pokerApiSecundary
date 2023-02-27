"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = __importDefault(require("./deck"));
class Round {
    constructor(preflop, players, initialAmount) {
        this.stages = [preflop];
        this.roundDeck = deck_1.default.instance.getRoundDeck(players.length);
        this.players = players;
        this.amount = initialAmount;
    }
    getPotentialActions(playerUid, lastRaised) {
        if (lastRaised) {
            return;
        }
        const diference = this.getHighestPersAmount() - this.getPersAmount(playerUid);
        if (diference > 0) {
            return {
                actions: ['CALL', 'RAISE', 'FOLD'],
                diference
            };
        }
        return { actions: ['CHECK', 'BET'] };
    }
    getHighestAmount() {
        return this.getActualStage().find(({ highest }) => highest);
    }
    checkIfHighestAmount(paramAmount) {
        const turn = this.getHighestAmount();
        if (!turn?.highest || !turn.amount)
            return false;
        return turn.amount > paramAmount;
    }
    getActualStage() {
        if (this.stages.length == 1)
            return this.stages[0];
        if (this.stages.length == 2)
            return this.stages[1];
        if (this.stages.length == 3)
            return this.stages[2];
        return this.stages[3];
    }
    getActualStageName() {
        if (this.stages.length == 1)
            return 'preflop';
        if (this.stages.length == 2)
            return 'flop';
        if (this.stages.length == 3)
            return 'turn';
        return 'river';
    }
    setNewStage() {
        this.stages.push([]);
    }
    groupByUid() {
        return this.getActualStage().reduce((grouped, turn) => {
            const finded = grouped.findIndex(({ playerUid }) => playerUid == turn.playerUid);
            finded != -1
                ? grouped[finded].turns.push(turn)
                : grouped.push({ turns: [turn], playerUid: turn.playerUid });
            return grouped;
        }, []);
    }
    getPersAmount(playerUidToFind) {
        const groupedTurns = this.groupByUid();
        return groupedTurns.find(({ playerUid }) => playerUid == playerUidToFind)
            ?.turns
            .reduce((total, { amount }) => {
            if (!amount)
                return total;
            return Number(total) + Number(amount);
        }, 0) ?? 0;
    }
    getHighestPersAmount() {
        const groupedTurns = this.groupByUid();
        return groupedTurns.reduce((highest, { playerUid }) => {
            const totalAmount = this.getPersAmount(playerUid);
            return totalAmount > highest
                ? totalAmount
                : highest;
        }, 0);
    }
    getStageCards() {
        const cards = this.roundDeck.slice(-5);
        switch (this.getActualStageName()) {
            case 'flop':
                return cards.slice(0, 3);
            case 'turn':
                return cards.slice(3, 4);
            case 'river':
                return cards.slice(-1);
        }
    }
    getLowerPlayerBalance() {
        return this.players.reduce((lower, player) => {
            const lowerBalance = lower.balance ?? 0;
            const currentBalance = player.balance ?? 0;
            if (currentBalance < lowerBalance)
                return player;
            return lower;
        });
    }
    getWinner() {
        const commonCards = this.roundDeck.slice(-5);
        const combinations = this.players.map(player => ({
            player: player.uid,
            combination: deck_1.default.getCombinationValue(player.cards?.concat(commonCards))
        }));
        /* FIXME: borrar los cns */
        console.log('------------------');
        for (const iterator of combinations) {
            console.log(this.players.find(({ uid }) => uid == iterator.player)?.cards?.concat(commonCards));
            console.log(iterator.player);
            console.log(iterator.combination);
        }
        const winners = combinations.reduce((winner, combination) => {
            if (winner[0].player == combination.player)
                return winner;
            if (winner[0].combination.herarchy < combination.combination.herarchy)
                return winner;
            if (winner[0].combination.herarchy > combination.combination.herarchy)
                return [combination];
            const winnerHighCardsCopy = [...winner[0].combination.highCardValues];
            for (const value of combination.combination.highCardValues) {
                const winnerValue = winnerHighCardsCopy?.shift() ?? -1;
                if (winnerValue > value)
                    return winner;
                if (winnerValue < value)
                    return [combination];
            }
            winner.push(combination);
            return winner;
        }, [combinations[0]])
            .map(({ player }) => player);
        console.log('winners', winners);
        return {
            winners,
            combinations
        };
    }
}
exports.default = Round;

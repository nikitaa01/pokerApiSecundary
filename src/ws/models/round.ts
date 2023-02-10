import Card from "../interfaces/card.interface"
import WsClient from "../interfaces/wsClient.interface"
import Deck from "./deck"
import Turn from "./turn"

export default class Round {
    readonly stages: Turn[][]
    readonly roundDeck: Card[]
    public players: WsClient[]
    public amount: number

    constructor(preflop: Turn[], players: WsClient[], initialAmount: number) {
        this.stages = [preflop]
        this.roundDeck = Deck.instance.getRoundDeck(players.length)
        this.players = players
        this.amount = initialAmount
    }

    getPotentialActions(playerUid: string, lastRaised: boolean) {
        if (lastRaised) {
            return
        }
        const diference = this.getHighestPersAmount() - this.getPersAmount(playerUid)
        if (diference > 0) {
            return {
                actions: ['CALL', 'RAISE', 'FOLD'],
                diference
            }
        }
        return { actions: ['CHECK', 'BET'] }
    }

    getHighestAmount() {
        return this.getActualStage().find(({ highest }) => highest)
    }

    checkIfHighestAmount(paramAmount: number) {
        const turn = this.getHighestAmount()
        if (!turn?.highest || !turn.amount) return false
        return turn.amount > paramAmount
    }

    getActualStage() {
        if (this.stages.length == 1) return this.stages[0]
        if (this.stages.length == 2) return this.stages[1]
        if (this.stages.length == 3) return this.stages[2]
        return this.stages[3]
    }

    getActualStageName() {
        if (this.stages.length == 1) return 'preflop'
        if (this.stages.length == 2) return 'flop'
        if (this.stages.length == 3) return 'turn'
        return 'river'
    }

    setNewStage() {
        this.stages.push([] as Turn[])
    }

    groupByUid() {
        return this.getActualStage().reduce((grouped: { turns: Turn[], playerUid: string }[], turn) => {
            const finded = grouped.findIndex(({ playerUid }) => playerUid == turn.playerUid)
            finded != -1
                ? grouped[finded].turns.push(turn)
                : grouped.push({turns: [turn], playerUid: turn.playerUid})
            return grouped
        }, [])
    }

    getPersAmount(playerUidToFind: string) {
        const groupedTurns = this.groupByUid()
        return groupedTurns.find(({ playerUid }) => playerUid == playerUidToFind)
            ?.turns
            .reduce((total, { amount }) => {
                if (!amount)
                    return total
                return Number(total) + Number(amount)
            }, 0) ?? 0
    }

    getHighestPersAmount() {
        const groupedTurns = this.groupByUid()
        return groupedTurns.reduce((highest: number, { playerUid }) => {
            const totalAmount = this.getPersAmount(playerUid)
            return totalAmount > highest
                ? totalAmount
                : highest
        }, 0)
    }

    getStageCards() {
        const cards = this.roundDeck.slice(-5)
        switch (this.getActualStageName()) {
        case 'flop':
            return cards.slice(0, 3)
        case 'turn':
            return cards.slice(3, 4)
        case 'river':
            return cards.slice(-1)
        }
    }

    getWinner() {
        const commonCards = this.roundDeck.slice(-5)
        for (const player of this.players) {
            console.log(player.uid)
            console.log(player.cards)
            Deck.getCombinationValue(player.cards?.concat(commonCards) as Card[])
        }
    }
}
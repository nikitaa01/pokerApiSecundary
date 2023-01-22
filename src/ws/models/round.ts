import Card from "../interfaces/card.interface"
import Deck from "./deck"
import Stage from "./stage"

export default class Round {
    readonly preflop: Stage
    readonly flop?: Stage
    readonly turn?: Stage
    readonly river?: Stage
    readonly roundDeck: Card[]

    constructor(preflop: Stage, numPlayers: number) {
        this.preflop = preflop
        this.roundDeck = Deck.instance.getRoundDeck(numPlayers)

    }

    getPotentialActions(playerUid: string) {
        const thisStage = this.getActualStage()
        const diference = thisStage.getHighestPersAmount() - thisStage.getPersAmount(playerUid)
        if (diference) {
            return {
                actions: ['CALL', 'RAISE', 'FOLD'],
                diference
            }
        }
        return { actions: ['CHECK', 'BET'] }
    }

    getHighestAmount() {
        return this.getActualStage().turns.find(({ highest }) => highest)
    }

    // TODO: si se recibe un "raise" entonces ese es highest
    checkIfHighestAmount(paramAmount: number) {
        const turn = this.getHighestAmount()

        if (!turn?.highest || !turn.amount) return false
        return turn.amount > paramAmount
    }

    getActualStage() {
        if (!this.flop) return this.preflop
        if (!this.turn) return this.flop
        if (!this.river) return this.turn
        return this.river
    }
}
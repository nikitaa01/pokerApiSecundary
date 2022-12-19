import Card from "../interfaces/card.interface"
import Stage from "../interfaces/stage.interface"
import turnAction from "../types/turnAction"
import Deck from "./deck"

export default class Round {
    public rised: boolean
    readonly preflop: Stage
    readonly flop?: Stage
    readonly turn?: Stage
    readonly river?: Stage
    readonly roundDeck: Card[]

    constructor(preflop: Stage, numPlayers: number) {
        this.rised = true
        this.preflop = preflop
        this.roundDeck = Deck.instance.getRoundDeck(numPlayers)
    }

    getPotentialActions(): turnAction[] {
        if (this.rised) {
            return ['CALL', 'RAISE', 'FOLD']
        }
        return ['CHECK', 'BET']
    }

    getActualStage() {
        if (!this.flop) return this.preflop
        if (!this.turn) return this.flop
        if (!this.river) return this.turn
        return this.river
    }
}
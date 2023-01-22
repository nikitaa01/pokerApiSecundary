import Turn from "./turn"

/* 
    FIXME: Stage debe desaparecer y tener un atributo para cada stage que sea un array de turnos dentro de la ronda
*/

export default class Stage {
    readonly turns: Turn[]
    readonly amount: number
    readonly name:  'preflop' | 'flop' | 'turn' | 'river'

    constructor (turns: Turn[], amount: number, name: 'preflop' | 'flop' | 'turn' | 'river') {
        this.turns = turns
        this.amount = amount
        this.name = name
    }

    groupByUid() {
        return this.turns.reduce((grouped: { turns: Turn[], playerUid: string }[], turn) => {
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
                return total + amount
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
}
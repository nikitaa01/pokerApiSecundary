import WsClient from "../interfaces/wsClient.interface"
import getWsClientsUids from "../utils/getWsClientsUid"
import Round from "./round"
import Stage from "./stage"
import Turn from "./turn"

export default class Game {
    readonly activePlayers: WsClient[]
    readonly rounds: Round[]
    readonly smallBlind: number
    readonly bigBlind: number

    constructor(activePlayers: WsClient[], smallBlind: number) {
        this.activePlayers = activePlayers
        this.smallBlind = smallBlind
        this.bigBlind = smallBlind * 2
        this.rounds = [this.getNewRound()]
    }

    private getNewRound() {
        const dealer = this.activePlayers.shift()
        if (!dealer) throw new Error('Game players array is empty')
        this.activePlayers.push(dealer)
        const players = [this.getTurnPlayer(0), this.getTurnPlayer(1)]
        console.table(getWsClientsUids(this.activePlayers))
        const round = new Round(
            new Stage(
                [
                    new Turn(
                        players[0].uid, 'BET', this.smallBlind,
                    ),
                    new Turn(
                        players[1].uid, 'RAISE', this.bigBlind,
                    ),
                ],
                this.smallBlind + this.bigBlind,
                'preflop',),
            this.activePlayers.length,
        )
        return round
    }

    public getLastRound() {
        return this.rounds[this.rounds.length - 1]
    }

    public getTurnPong(turn: Turn) {
        const player = this.activePlayers.find((wsClient) => wsClient.uid == turn.playerUid)
        if (!player) return
        if (turn.amount && player.balance) player.balance - turn.amount
        turn.sendedPong = true
        return { wsClients: this.activePlayers, status: turn.action, msg: turn.getGroupMsg() }
    }

    public getTurnPongQueue() {
        const pongQueue = []
        const noPongTurns = this.getLastRound().getActualStage().turns.filter(({ sendedPong }) => !sendedPong)
        for (const turn of noPongTurns) {
            const msg = this.getTurnPong(turn)
            if (!msg) return
            pongQueue.push(msg)
        }
        return pongQueue
    }

    public getNextPlayerWarning() {
        const turnPlayer = this.getTurnPlayer()
        return {
            wsClient: turnPlayer, status: 'WAITING', msg: this.getLastRound().getPotentialActions(turnPlayer.uid),
        }
    }

    public getPersonalCards() {
        const allCards = this.getLastRound().roundDeck
        const cardsToSend = []
        for (const player of this.activePlayers) {
            const cards = [allCards.pop(), allCards.pop()]
            if (cards.includes(undefined)) return
            player.cards = cards
            cardsToSend.push({ wsClient: player, status: 'PERS_CARD', msg: { cards }})
        }
        return cardsToSend
    }

    public getTurnPlayer(numTurn: number = this.getLastRound().getActualStage().turns.length) {
        return this.activePlayers[numTurn % this.activePlayers.length]
    }
}
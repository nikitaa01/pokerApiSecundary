import WsClient from "../interfaces/wsClient.interface"
import Round from "./round"
import Turn from "./turn"

export default class Game {
    readonly players: WsClient[]
    readonly rounds: Round[]
    readonly smallBlind: number
    readonly bigBlind: number

    constructor(players: WsClient[], smallBlind: number) {
        this.players = players
        this.smallBlind = smallBlind
        this.bigBlind = smallBlind * 2
        this.rounds = [this.getNewRound()]
    }

    private getNewRound() {
        const round = new Round(
            {
                turns: [
                    new Turn(
                        this.getTurnPlayer(0).uid, 'DEALER',
                    ),
                    new Turn(
                        this.getTurnPlayer(1).uid, 'BET', this.smallBlind,
                    ),
                    new Turn(
                        this.getTurnPlayer(2).uid, 'RAISE', this.bigBlind,
                    ),
                ],
                amount: this.smallBlind + this.bigBlind
            },
            this.players.length
        )
        return round
    }

    public getLastRound() {
        return this.rounds[this.rounds.length - 1]
    }

    public getMessageQueue() {
        const messageQueue = []
        const noPongTurns = this.getLastRound().getActualStage().turns.filter(({ sendedPong }) => !sendedPong)
        for (const turn of noPongTurns) {
            const wsClient = this.players.find((wsClient) => wsClient.uid == turn.playerUid)
            if (!wsClient) break
            turn.sendedPong = true
            messageQueue.push({ wsClients: this.players, status: turn.action, msg: turn.getGroupMsg() })
        }
        return messageQueue
    }

    public getNextPlayerWarning() {
        return {
            wsClient: this.getTurnPlayer(), status: 'WAITING', msg: {
                actions: this.getLastRound().getPotentialActions()
            }
        }
    }

    public getPersonalCards() {
        const allCards = this.getLastRound().roundDeck
        const cardsToSend = []
        for (const player of this.players) {
            const cards = [allCards.pop(), allCards.pop()]
            if (cards.includes(undefined)) throw new Error("Cards not found");
            player.cards = cards
            cardsToSend.push({ wsClient: player, status: 'PERS_CARD', msg: { cards }})
        }
        return cardsToSend
    }

    public getTurnPlayer(numTurn: number = this.getLastRound().getActualStage().turns.length) {
        return this.players[numTurn % this.players.length]
    }
}
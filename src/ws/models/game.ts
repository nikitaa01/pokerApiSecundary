import WsClient from "../interfaces/wsClient.interface"
import getWsClientsUids from "../utils/getWsClientsUid"
import Round from "./round"
import Turn from "./turn"

export default class Game {
    public activePlayers: WsClient[]
    readonly rounds: Round[]
    readonly smallBlind: number
    readonly bigBlind: number

    constructor(activePlayers: WsClient[], reward: number) {
        const persBalance = reward
        const smallBlind = Math.trunc(persBalance / 20)
        this.activePlayers = activePlayers.map(player => {
            player.lastRaised = false
            player.balance = persBalance
            return player
        })
        this.smallBlind = smallBlind
        this.bigBlind = smallBlind * 2
        this.rounds = [this.getNewRound()]
    }

    private getNewRound() {
        const dealer = this.activePlayers.shift()
        if (!dealer) throw new Error('Game players array is empty')
        this.activePlayers.push(dealer)
        const players = [this.getTurnPlayer(this.activePlayers, 0), this.getTurnPlayer(this.activePlayers, 1)]
        players[0].balance = players[0].balance as number - this.smallBlind 
        players[1].balance = players[1].balance as number - this.bigBlind 
        players[1].lastRaised = true
        const round = new Round(
            [
                new Turn(
                    players[0].uid, 'BET', this.smallBlind,
                ),
                new Turn(
                    players[1].uid, 'RAISE', this.bigBlind,
                ),
            ],
            this.activePlayers,
            (this.smallBlind + this.bigBlind),
        )
        return round
    }

    public setNewRound() {
        this.rounds.push(this.getNewRound())
    }

    public resetLastRaised() {
        this.getLastRound().players = this.getLastRound().players.map(player => {
            player.lastRaised = false
            return player
        })
    }

    public getLastRound() {
        return this.rounds.at(-1) as Round
    }

    public getTurnPong(turn: Turn) {
        const players = this.getLastRound().players
        const player = players.find((wsClient) => wsClient.uid == turn.playerUid)
        if (!player) return
        if (turn.amount && player.balance) player.balance - turn.amount
        turn.sendedPong = true
        return { wsClients: players, status: turn.action, msg: turn.getGroupMsg() }
    }

    public getTurnPongQueue() {
        const pongQueue = []
        const noPongTurns = this.getLastRound().getActualStage().filter(({ sendedPong }) => !sendedPong)
        for (const turn of noPongTurns) {
            const msg = this.getTurnPong(turn)
            if (!msg) return
            pongQueue.push(msg)
        }
        return pongQueue
    }

    public getNextPlayerWarning() {
        const turnPlayer = this.getTurnPlayer()
        if (turnPlayer.lastRaised === undefined) throw new Error("getNextPlayerWarning func no last raised atribute");
        const msg = this.getLastRound().getPotentialActions(turnPlayer.uid, turnPlayer.lastRaised)
        if (!msg) return
        return {
            wsClient: turnPlayer, status: 'WAITING', msg,
        }
    }

    public getPersonalCards() {
        const allCards = this.getLastRound().roundDeck
        const cardsToSend = []
        for (const player of this.getLastRound().players) {
            const cards = [allCards.pop(), allCards.pop()]
            if (cards.includes(undefined)) return
            player.cards = cards
            cardsToSend.push({ wsClient: player, status: 'PERS_CARDS', cards })
        }
        return cardsToSend
    }

    public getTurnPlayer(players = this.getLastRound().players, numTurns = -1) {
        let numTurnsReturn = numTurns
        if (numTurnsReturn == -1) {
            const playersUids = getWsClientsUids(players)
            numTurnsReturn = this.getLastRound().getActualStage()
                .filter(({ playerUid }) => playersUids.includes(playerUid))
                .length
        }
        return players[numTurnsReturn % players.length]
    }
}
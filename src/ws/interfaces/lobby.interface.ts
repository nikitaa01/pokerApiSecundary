import Game from "../models/game"
import WsClient from "./wsClient.interface"

export default interface Lobby {
    gid: string
    wsClients: WsClient[]
    reward: number
    game?: Game
}
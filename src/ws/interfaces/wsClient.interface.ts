import { WebSocket } from "ws"
import Card from "./card.interface"

export default interface WsClient extends WebSocket {
    uid: string
    gid: string
    balance?: number
    cards?: (Card | undefined)[]
}

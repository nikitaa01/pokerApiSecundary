import Turn from "../models/turn"

export default interface Stage {
    turns: Turn[]
    amount: number
}
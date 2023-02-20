import Card from "./card.interface"

export default interface Combination {
    combination: Card[],
    highCardValues: number[],
    herarchy: number,
}
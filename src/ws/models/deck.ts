import deckCardsDefinition from "../utils/deckCards"
import Card from "../interfaces/card.interface"

export default class Deck {
    private deckCards = deckCardsDefinition
    static readonly instance = new Deck()

    getRoundDeck(numPlayers: number) {
        const deck = new Set<Card>()
        const deckSize = (numPlayers * 2) + 5

        while (deck.size != deckSize) {
            deck.add(this.deckCards[Math.floor(Math.random() * 52)])
        }
        return [...deck]
    }

    getIsStraight(cards: number[], n1: number, n2 = n1 + 1, count = 1): number[] | false {
        if (count == 5) {
            return cards.slice(n1, n1 + 5)
        }
        if (cards[n1] == cards[n2] - count) {
            return this.getIsStraight(cards, n1, n2 + 1, count + 1)
        }
        return false
    }

    getIsStraightLoop(cards: number[], n1 = 0, n2 = n1 + 1, count = 1, countBackward = 0, forward = true): number[] | false {
        if (count == 5) {
            const backwardNum = -1 * countBackward
            return [
                ...cards.slice(0, 5 + backwardNum),
                ...cards.slice(backwardNum)
            ];
        }
        if (forward && cards[n1] == cards[n2] + count) {
            return this.getIsStraightLoop(cards, n1, n2 + 1, count + 1, countBackward, forward);
        }
        if (!forward && cards[n1] == cards.at(n2) as number + (12 - countBackward)) {
            return this.getIsStraightLoop(cards, n1, n2 - 1, count + 1, countBackward + 1, forward);
        }
        if (forward) {
            return this.getIsStraightLoop(cards, n1, -1, count, countBackward, false)
        }
        return false;
    }

    isStraight(cards: Card[]) {
        const straight = [...new Set(cards.map((card) => card.value))]
        for (let i = 0; i < 3; i++) {
            if (this.getIsStraight(straight, i)) {
                return cards.slice(i, i + 5)
            }
        }
        if (straight[0] != 2 || straight.at(-1) != 14) {
            return false
        }
        return this.getIsStraightLoop(straight.reverse())
    }

    getCombinationValue(cards: Card[]) {
        if (cards.length != 7) return false
        const cardsSorted = cards.sort((cardA: Card, cardB: Card) => cardA.value - cardB.value)
        const isStraight = this.isStraight(cardsSorted)
        console.log(isStraight)
        return true
    }
}
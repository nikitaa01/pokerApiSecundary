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

    getCombinationValue(cards: Card[]) {
        if (cards.length != 7) return false
        
    }
}
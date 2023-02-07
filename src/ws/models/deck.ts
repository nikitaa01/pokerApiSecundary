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

    isStraight(cards: Card[]) {
        const straight = new Set(cards
            .map(card => card.value))
    }

    getCombinationValue(cards: Card[]) {
        if (cards.length != 7) return false
        const cardsSorted = cards.sort((cardA, cardB) => cardA.value - cardB.value)
        // if (this.isStraight(cardsSorted)) {

        // }
    }
    // function getIsStraightLineal(cards, n1, n2 = n1 + 1, count = 1) {
    //     if (count == 5) {
    //       return cards.slice(n1, 6);
    //     }
    //     if (cards[n1] == cards[n2] - count) {
    //       return getIsStraightLineal(cards, n1, n2 + 1, count + 1);
    //     }
    //     return false;
    //   }
    //   function getIsStraightReverse() {
    //     return
    //   }
    //   function getIsStraightForward() {
    //     return
    //   }
    //   function isStraight(cards) {
    //     const straight = [...new Set(cards.map((card) => card.value))];
    //     if (straight.lenght < 5) {
    //       return false
    //     }
    //     if (cards[0] == 2 && cards[4] != 6) {
    //       return getIsStraightReverse()
    //     }
    //     if (cards.reverse()[0] == 14 && cards.reverse()[4] != 10) {
    //       return getIsStraightForward()
    //     }
    //     let ctrl = false
    //     for (let i = 0; i < 2; i++) {
    //        if (getIsStraightLineal(straight, i)) {
    //          ctrl = true
    //        }
    //     }
    //     return ctrl
    //   }
    //   function getCombinationValue(cards) {
    //     if (cards.length != 7) return false;
    //     const cardsSorted = cards.sort((cardA, cardB) => cardA.value - cardB.value);
    //     console.log(this.isStraight(cardsSorted))
    //   }
    //   const cards = [
    //     {
    //       suit: "heart",
    //       value: 2,
    //     },
    //     {
    //       suit: "heart",
    //       value: 2,
    //     },{
    //       suit: "heart",
    //       value: 10,
    //     },{
    //       suit: "heart",
    //       value: 11,
    //   },{
    //       suit: "heart",
    //       value: 12,
    //   },{
    //       suit: "heart",
    //       value: 13,
    //   }, {
    //       suit: "heart",
    //       value: 14,
    //       },
    //   ];
    //   getCombinationValue(cards)
      
}
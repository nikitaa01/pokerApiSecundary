import deckCardsDefinition from "../utils/deckCards"
import Card from "../interfaces/card.interface"
import Combination from "../interfaces/combination.interface"

export default class Deck {
    private deckCards = deckCardsDefinition
    static readonly instance = new Deck()


    /* FIXME: mirar si es la escalera mas alta posible */
    getRoundDeck(numPlayers: number): Card[] {
        // const deck = new Set<Card>()
        // const deckSize = (numPlayers * 2) + 5

        // while (deck.size != deckSize) {
        //     deck.add(this.deckCards[Math.floor(Math.random() * 52)])
        // }
        // return [...deck]
        return [
            {
                suit: 'club',
                value: 8,
            },
            {
                suit: 'club',
                value: 7,
            },
            {
                suit: 'club',
                value: 6,
            },
            {
                suit: 'club',
                value: 5,
            },
            {
                suit: 'club',
                value: 14,
            },
            {
                suit: 'club',
                value: 10,
            },
            {
                suit: 'club',
                value: 9,
            },
            {
                suit: 'spade',
                value: 14,
            },
            {
                suit: 'spade',
                value: 2,
            },
        ]
    }

    static getIsStraight(cards: Card[], n1: number, n2 = n1 + 1, count = 1): Combination | false {
        if (count == 5) {
            return {
                combination: cards.slice(n1, n1 + 5).reverse(),
                highCardCombintation: cards[n1 + 4],
            };
        }
        if (cards[n1].value == cards[n2].value - count) {
            return Deck.getIsStraight(cards, n1, n2 + 1, count + 1);
        }
        return false;
    }

    static getIsStraightLoop(cards: Card[], n2: number, count = 1, countForward = 1, backward = true): Combination | false {
        if (count == 5) {
            return {
                combination: [
                    ...cards.slice(-1 * (5 - countForward)),
                    ...cards.slice(0, countForward),
                ],
                highCardCombintation: cards.at(-1 * (5 - countForward)) as Card,
            }
        }
        if (backward && cards[0].value == cards.at(n2)?.value as number + (13 - count)) {
            return Deck.getIsStraightLoop(cards, n2 - 1, count + 1, countForward, backward);
        }
        if (!backward && cards[0].value == cards[n2].value + countForward) {
            return Deck.getIsStraightLoop(cards, n2 + 1, count + 1, countForward + 1, backward);
        }
        if (backward) {
            return Deck.getIsStraightLoop(cards, 1, count, countForward, false)
        }
        return false;
    }

    static isStraight(cards: Card[]): Combination | false {
        const uniqueValues = new Set();
        const cardsUnique = cards
            .sort((cardA: Card, cardB: Card) => cardB.value - cardA.value)
            .filter(card => {
                if (!uniqueValues.has(card.value)) {
                    uniqueValues.add(card.value);
                    return true;
                }
                return false;
            })
        if (cardsUnique.length < 6) {
            return false
        }
        for (let i = (cardsUnique.length - 5); i != -1;  i--) {
            const isStraightLineal = Deck.getIsStraight([...cardsUnique].reverse(), i)
            if (isStraightLineal) {
                return isStraightLineal
            }
        }
        if (cardsUnique[0].value != 14 || cardsUnique.at(-1)?.value != 2) return false
        return Deck.getIsStraightLoop(cardsUnique, -1)
    }

    static getCombinationValue(cards: Card[]) {
        if (cards.length != 7) return false
        console.log(Deck.isStraight(cards))
    }
}
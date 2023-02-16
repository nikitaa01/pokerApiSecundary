import deckCardsDefinition from "../utils/deckCards"
import Card from "../interfaces/card.interface"
import Combination from "../interfaces/combination.interface"

export default class Deck {
    private deckCards = deckCardsDefinition
    static readonly instance = new Deck()

    getRoundDeck(numPlayers: number): Card[] {
        const deck = new Set<Card>()
        const deckSize = (numPlayers * 2) + 5

        while (deck.size != deckSize) {
            deck.add(this.deckCards[Math.floor(Math.random() * 52)])
        }
        return [...deck]
        // return [
        //     {
        //         suit: 'club',
        //         value: 12,
        //     },
        //     {
        //         suit: 'club',
        //         value: 13,
        //     },
        //     {
        //         suit: 'club',
        //         value: 11,
        //     },
        //     {
        //         suit: 'club',
        //         value: 14,
        //     },
        //     {
        //         suit: 'club',
        //         value: 14,
        //     },
        //     {
        //         suit: 'club',
        //         value: 10,
        //     },
        //     {
        //         suit: 'club',
        //         value: 9,
        //     },
        //     {
        //         suit: 'spade',
        //         value: 14,
        //     },
        //     {
        //         suit: 'spade',
        //         value: 14,
        //     },
        // ]
    }

    static getIsStraight(cards: Card[], n1: number, n2 = n1 + 1, count = 1): Combination | false {
        if (count == 5) {
            return {
                combination: cards.slice(n1, n1 + 5).reverse(),
                highCardCombintation: cards[n1 + 4],
                herarchy: 5,
            }
        }
        if (cards[n1].value == cards[n2].value - count) {
            return Deck.getIsStraight(cards, n1, n2 + 1, count + 1)
        }
        return false
    }

    static getIsStraightLoop(cards: Card[], n2: number, count = 1, countForward = 1, backward = true): Combination | false {
        if (count == 5) {
            return {
                combination: [
                    ...cards.slice(-1 * (5 - countForward)),
                    ...cards.slice(0, countForward),
                ],
                highCardCombintation: cards.at(-1 * (5 - countForward)) as Card,
                herarchy: 5,
            }
        }
        if (backward && cards[0].value == cards.at(n2)?.value as number + (13 - count)) {
            return Deck.getIsStraightLoop(cards, n2 - 1, count + 1, countForward, backward)
        }
        if (!backward && cards[0].value == cards[n2].value + countForward) {
            return Deck.getIsStraightLoop(cards, n2 + 1, count + 1, countForward + 1, backward)
        }
        if (backward) {
            return Deck.getIsStraightLoop(cards, 1, count, countForward, false)
        }
        return false
    }

    static isStraight(cards: Card[]): Combination | false {
        const uniqueValues = new Set()
        const cardsUnique = cards
            .sort((cardA: Card, cardB: Card) => cardB.value - cardA.value)
            .filter(card => {
                if (!uniqueValues.has(card.value)) {
                    uniqueValues.add(card.value)
                    return true
                }
                return false
            })
        if (cardsUnique.length < 6) {
            return false
        }
        for (let i = (cardsUnique.length - 5); i != -1; i--) {
            const isStraightLineal = Deck.getIsStraight([...cardsUnique].reverse(), i)
            if (isStraightLineal) {
                return isStraightLineal
            }
        }
        if (cardsUnique[0].value != 14 || cardsUnique.at(-1)?.value != 2) return false
        return Deck.getIsStraightLoop(cardsUnique, -1)
    }

    static isRepeat(cards: Card[], nRepeat: number, herarchy: number): Combination | false {
        const uniqueValues = new Set()
        const cardsUnique = cards
            .sort((cardA: Card, cardB: Card) => cardB.value - cardA.value)
            .filter(card => {
                if (!uniqueValues.has(card.value)) {
                    uniqueValues.add(card.value)
                    return true
                }
                return false
            })
        for (const card of cardsUnique) {
            const repeat = cards.filter(c => c.value == card.value).slice(-nRepeat)
            if (repeat.length == nRepeat) {
                return {
                    combination: repeat,
                    highCardCombintation: card,
                    herarchy,
                }
            }
        }
        return false
    }

    static isFourOfAKind(cards: Card[]): Combination | false {
        return Deck.isRepeat(cards, 4, 2)
    }

    static isFullHouse(cards: Card[]): Combination | false {
        const threeOfAKindHigh = Deck.isThreeOfAKind(cards)
        if (threeOfAKindHigh) {
            const pairLow = Deck.isPair(cards.filter(c => !threeOfAKindHigh.combination.includes(c)))
            if (!pairLow) return false
            return {
                combination: [...threeOfAKindHigh.combination, ...pairLow.combination],
                highCardCombintation: threeOfAKindHigh.highCardCombintation,
                herarchy: 3,
            }
        }
        const pairHigh = Deck.isPair(cards)
        if (pairHigh) {
            const threeOfAKindLow = Deck.isThreeOfAKind(cards.filter(c => !pairHigh.combination.includes(c)))
            if (!threeOfAKindLow) return false
            return {
                combination: [...threeOfAKindLow.combination, ...pairHigh.combination],
                highCardCombintation: threeOfAKindLow.highCardCombintation,
                herarchy: 3,
            }
        }
        return false
    }

    static isFlush(cards: Card[]): Combination | false {
        const uniqueSuits = new Set()
        const cardsUnique = cards
            .sort((cardA: Card, cardB: Card) => cardB.value - cardA.value)
            .filter(card => {
                if (!uniqueSuits.has(card.suit)) {
                    uniqueSuits.add(card.suit)
                    return true
                }
                return false
            })
        for (const card of cardsUnique) {
            const flush = cards.filter(c => c.suit == card.suit).slice(-5)
            if (flush.length === 5) {
                return {
                    combination: flush,
                    highCardCombintation: flush[0],
                    herarchy: 4,
                }
            }
        }
        return false
    }

    static isThreeOfAKind(cards: Card[]): Combination | false {
        return Deck.isRepeat(cards, 3, 6)
    }

    static isTwoPair(cards: Card[]): Combination | false {
        const pairHigh = Deck.isRepeat(cards, 2, 8)
        if (pairHigh) {
            const pairLow = Deck.isRepeat(cards.filter(c => !pairHigh.combination.includes(c)), 2, 8)
            if (!pairLow) return false
            return {
                combination: [...pairHigh.combination, ...pairLow.combination],
                highCardCombintation: pairHigh.highCardCombintation,
                herarchy: 7,
            }
        }
        return false
    }

    static isPair(cards: Card[]): Combination | false {
        return Deck.isRepeat(cards, 2, 8)
    }

    static getCombinationValue(cards: Card[]) {
        const isStraight = Deck.isStraight(cards)
        if (isStraight) {
            const isStraightFlush = Deck.isFlush(isStraight.combination)
            if (isStraightFlush) {
                if (isStraightFlush.highCardCombintation.value == 14) {
                    isStraightFlush.herarchy = 0
                    return isStraightFlush
                }
                isStraightFlush.herarchy = 1
                return isStraightFlush
            }
        }
        const isFourOfAKind = Deck.isFourOfAKind(cards)
        if (isFourOfAKind) {
            return isFourOfAKind
        }
        const isFullHouse = Deck.isFullHouse(cards)
        if (isFullHouse) {
            return isFullHouse
        }
        const isFlush = Deck.isFlush(cards)
        if (isFlush) {
            return isFlush
        } else if (isStraight) {
            return isStraight
        }
        const isThreeOfAKind = Deck.isThreeOfAKind(cards)
        if (isThreeOfAKind) {
            return isThreeOfAKind
        }
        const isTwoPair = Deck.isTwoPair(cards)
        if (isTwoPair) {
            return isTwoPair
        }
        const isPair = Deck.isPair(cards)
        if (isPair) {
            return isPair
        }
        const higherCard = cards.sort((cardA: Card, cardB: Card) => cardB.value - cardA.value)[0]
        return { combination: [higherCard], highCardCombintation: higherCard, herarchy: 9 }
    }
}
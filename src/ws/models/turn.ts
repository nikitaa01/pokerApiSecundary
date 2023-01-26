import turnAction from "../types/turnAction"

export default class Turn {
    readonly playerUid: string
    readonly action: turnAction
    readonly amount?: number
    public highest?: boolean
    public sendedPong: boolean

    constructor(playerUid: string, action: turnAction, amount?: number) {
        this.playerUid = playerUid
        this.action = action
        this.sendedPong = false
        if (amount) this.amount = amount
    }

    public getSelfMsg() {
        switch (this.action) {
        case 'DEALER':
            console.log('hola')
            break
        case 'CHECK':
            console.log('hola')
            break
        case 'BET':
            console.log('hola')
            break
        case 'CALL':
            console.log('hola')
            break
        case 'RAISE':
            console.log('hola')
            break
        case 'FOLD':
            console.log('hola')
            break
        }
        return undefined
    }

    public getGroupMsg() {
        switch (this.action) {
        case 'DEALER':
            return {
                uid: this.playerUid,
            }
        case 'CHECK':
            return {
                uid: this.playerUid,
                amount: this.amount
            }
        case 'BET':
            return {
                uid: this.playerUid,
                amount: this.amount
            }
        case 'CALL':
            return {
                uid: this.playerUid,
                amount: this.amount
            }
            break
        case 'RAISE':
            return {
                uid: this.playerUid,
                amount: this.amount
            }
        case 'FOLD':
            console.log('hola')
            break
        }
        return {
            uid: 'tupu',
            balance: 0
        }
    }
}
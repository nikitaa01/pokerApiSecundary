"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Turn {
    constructor(playerUid, action, amount) {
        this.playerUid = playerUid;
        this.action = action;
        this.sendedPong = false;
        if (amount)
            this.amount = amount;
    }
    getSelfMsg() {
        switch (this.action) {
            case 'CHECK':
                console.log('hola');
                break;
            case 'BET':
                console.log('hola');
                break;
            case 'CALL':
                console.log('hola');
                break;
            case 'RAISE':
                console.log('hola');
                break;
            case 'FOLD':
                console.log('hola');
                break;
        }
        return undefined;
    }
    getGroupMsg() {
        switch (this.action) {
            case 'CHECK':
                return {
                    uid: this.playerUid,
                    amount: this.amount
                };
            case 'BET':
                return {
                    uid: this.playerUid,
                    amount: this.amount
                };
            case 'CALL':
                return {
                    uid: this.playerUid,
                    amount: this.amount
                };
            case 'RAISE':
                return {
                    uid: this.playerUid,
                    amount: this.amount
                };
            case 'FOLD':
                return {
                    uid: this.playerUid,
                };
        }
    }
}
exports.default = Turn;

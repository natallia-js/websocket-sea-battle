export enum UserMessageTypes {
    reg = 'reg',
    add_user_to_room = 'add_user_to_room',
    create_room = 'create_room',

    add_ships = 'add_ships',
    attack = 'attack',
    randomAttack = 'randomAttack',

    single_play = 'single_play',
}

export enum ServerMessageTypes {
    // personal response
    reg = 'reg',

    // responses for the game room
    create_game = 'create_game',
    start_game = 'start_game',
    turn = 'turn',
    attack = 'attack',
    finish = 'finish',
    diconnect = 'diconnect',

    // responses for all
    update_room = 'update_room',
    update_winners = 'update_winners',
}

export type UserMessage = {
    type: string;
    data: any;
    id: number;
}

export type ServerMessage = {
    type: string;
    data: any;
    id: number;
}

export class UserWSData {
    private clientIP: string;
    private userId: string;
    constructor(clientIP: string | undefined, userId: string | undefined) {
        this.setClientIP(clientIP);
        this.setUserID(userId);
    }
    public setClientIP(clientIP: string | undefined) {
        this.clientIP = clientIP || '?';
    }
    public setUserID(userId: string | undefined) {
        this.userId = userId || '';
    }
    public getClientIP() {
        return this.clientIP;
    }
    public getUserID() {
        return this.userId;
    }
}

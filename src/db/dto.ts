import WebSocket from 'ws';

export interface User {
    login: string,
    password: string,
    isAlive: boolean,
    lastRequestDateTime: Date,
    wins: number,
    ws: WebSocket | undefined,
}

export interface IdentifiedUser extends User {
    id: string,
}

export type Position = {
    x: number,
    y: number,
}

export enum ShipType {
    small = 'small',
    medium = 'medium',
    large = 'large',
    huge = 'huge',
}

export enum AttackStatus {
    miss = 'miss',
    killed = 'killed',
    shot = 'shot',
}

export class Ship {
    private position: Position;
    private direction: boolean;
    private length: number;
    private type: ShipType;
    private injuredPositions: Position[];
    constructor(position: Position, direction: boolean, length: number, type: ShipType) {
        this.position = position;
        this.direction = direction;
        this.length = length;
        this.type = type;
        this.injuredPositions = [];
    }
    public attack(position: Position): AttackStatus {
        if (this.direction) {
            if (position.x === this.position.x &&
                this.position.y <= position.y &&
                position.y <= this.position.y + this.length - 1) {
                this.addPointToInjuredPositions(position);           
            } else
                return AttackStatus.miss;
        } else {
            if (position.y === this.position.y &&
                this.position.x <= position.x &&
                position.x <= this.position.x + this.length - 1) {
                this.addPointToInjuredPositions(position);
            } else
                return AttackStatus.miss;
        }
        return this.isDead() ? AttackStatus.killed : AttackStatus.shot;
    }
    public addPointToInjuredPositions(point: Position) {
        if (!this.injuredPositions.find(pos => pos.x === point.x && pos.y === point.y))
            this.injuredPositions.push(point);
    }
    public isDead(): boolean {
        return this.length === this.injuredPositions.length;
    }
    public getShipType() {
        return this.type;
    }
    public getPosition() {
        return this.position;
    }
    public getDirection() {
        return this.direction;
    }
    public getLength() {
        return this.length;
    }
    public getType() {
        return this.type;
    }
}

export class GameBoard {
    private ships: Ship[];
    constructor() {
        this.ships = [];
    }
    public addShips(ships: Ship[]) {
        this.ships = ships || [];
    }
    public getShipsNumber() {
        return this.ships.length;
    }
    public getShips() {
        return this.ships;
    }
    public attack(position: Position): AttackStatus {
        let attackStatus: AttackStatus = AttackStatus.miss;
        for (let ship of this.ships) {
            attackStatus = ship.attack(position);
            if (attackStatus !== AttackStatus.miss)
                break;
        }
        return attackStatus;
    }
    public ifAllShipsAreDead() {
        return !this.ships.find(ship => !ship.isDead());
    }
}

export interface UserInGame extends IdentifiedUser {
    userGameId: string,
    gameBoard: GameBoard;
}

export type Game = {
    id: string,
    users: UserInGame[],
    currentPlayer: UserInGame | undefined,
    winner: UserInGame | undefined,
}

export type Room = {
    id: string,
    users: IdentifiedUser[];
    game: Game | null;
}

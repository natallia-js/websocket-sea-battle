import { v4 as uuidv4  } from 'uuid';
import WebSocket from 'ws';
import { IdentifiedUser, Room, Game, GameBoard, UserInGame, Ship, Position, AttackStatus } from './dto.js';
import Lock from './lock.js';

class DB {
    private users: IdentifiedUser[] = [];
    private rooms: Room[] = [];
    private lock: Lock = new Lock();

    constructor() {}

    public addUser(login: string, password: string, ws: WebSocket | undefined): string | undefined {
        this.lock.acquire();
        try {
            const userWithTheSameLogin = this.users.find(user => user.login === login);
            if (userWithTheSameLogin) {
                if (userWithTheSameLogin.isAlive || userWithTheSameLogin.password !== password)
                    return undefined;
                userWithTheSameLogin.isAlive = true;
                userWithTheSameLogin.ws = ws;
                userWithTheSameLogin.lastRequestDateTime = new Date();
                return userWithTheSameLogin.id;
            }
            const userId = uuidv4();
            this.users.push({
                id: userId,
                login,
                password,
                isAlive: true,
                lastRequestDateTime: new Date(),
                wins: 0,
                ws,
            });
            return userId;
        } finally {
            this.lock.release();
        }
    }

    public createRoom(): string {
        const roomId = uuidv4();
        this.rooms.push({
            id: roomId,
            users: [],
            game: null,
        });
        return roomId;
    }

    public addUserToRoom(userId: string, roomId: string) {
        const room = this.rooms.find(el => el.id === roomId);
        if (!room)
            return;
        const user = this.getUser(userId);
        if (!user)
            return;
        if (room.users.length === 2)
            return;
        if (room.users.find(user => user.id === userId))
            return;
        room.users.push(user);
    }

    public createGame(roomId: string): Game | null {
        const room = this.rooms.find(room => room.id === roomId);
        if (!room)
            return null;
        if (room.users.length < 2)
            return null;
        const usersInGame: UserInGame[] = room.users.map(user => {
            return {
                ...user,
                userGameId: uuidv4(),
                gameBoard: new GameBoard(),
            };
        });
        const game: Game = {
            id: uuidv4(),
            users: usersInGame,
            currentPlayer: usersInGame[0],
            winner: undefined,
        };
        room.game = game;
        return game;
    }

    public setUserAlive(userId: string) {
        const user = this.users.find(el => el.id === userId);
        if (user) {
            user.isAlive = true;
            user.lastRequestDateTime = new Date();
        }
    }

    public setUserDisconnected(userId: string) {
        const user = this.users.find(el => el.id === userId);
        if (!user)
            return;
        user.isAlive = false;
        // getting user room
        const userActiveRoomIndex = this.rooms.findIndex(room => room.users.find(el => el.id === userId));
        if (userActiveRoomIndex === -1)
            return;
        // deleting disconnected user from room
        this.rooms[userActiveRoomIndex].users = this.rooms[userActiveRoomIndex].users.filter(el => el.id !== userId);
        if (!this.rooms[userActiveRoomIndex].users.length) {
            // deleting room if there are no users in it
            this.rooms.splice(userActiveRoomIndex, 1);
        } else {
            // getting game that user room belongs to
            const game = this.rooms[userActiveRoomIndex].game;
            if (game) {
                // setting the other player as a winner in a game
                const gameWinner = (game as Game).users.find(el => el.id !== userId);
                if (gameWinner)
                    this.setGameWinner(game as Game, gameWinner);
                // deleting game
                this.rooms[userActiveRoomIndex].game = null;
            }
        }
    }

    public getUser(userId: string): IdentifiedUser | undefined {
        return this.users.find(el => el.id === userId);
    }

    public getAllUsers(): IdentifiedUser[] {
        return this.users;
    }

    public getRoom(roomId: string): Room | undefined {
        return this.rooms.find(el => el.id === roomId);
    }

    public getUserLogin(userId: string): string {
        return this.users.find(el => el.id === userId)?.login || '?';
    }

    public getAllAvailableRooms(): Room[] {
        return this.rooms.filter(room => room.users.length < 2);
    }

    public getAllRooms(): Room[] {
        return this.rooms;
    }

    public getGame(gameId: string): Game | null | undefined {
        return this.rooms.find(room => room.game?.id === gameId)?.game;
    }

    public getUserGame(userId: string): Game | null | undefined {
        // userId - not a userGameId!
        return this.rooms.find(room => room.game?.users.find(el => el.id === userId))?.game;
    }

    public addUserShips(gameId: string, playerId: string, ships: Ship[]): string | null {
        const room = this.rooms.find(room => room.game?.id === gameId);
        if (!room)
            return null;
        const gameUser = room.game?.users.find(user => user.userGameId === playerId);
        if (!gameUser)
            return null;
        gameUser.gameBoard.addShips(ships);
        return gameId;
    }

    private setGameWinner(game: Game, gameUser: UserInGame) {
        game.winner = gameUser;
        const user = this.users.find(user => user.id === gameUser.id);
        if (user)
            user.wins += 1;
    }

    public attack(gameId: string, currentPlayerId: string, position: Position) {
        const game = this.rooms.find(room => room?.game?.id === gameId)?.game;
        if (!game)
            return null;
        if (game.currentPlayer?.userGameId !== currentPlayerId)
            return null;
        const gameUser = game.users.find(user => user.userGameId === currentPlayerId);
        if (!gameUser)
            return null;
        const nextGameUser = game.users.find(user => user.userGameId !== currentPlayerId);            
        if (!nextGameUser)
            return null;
        const attackStatus: AttackStatus = nextGameUser.gameBoard.attack(position);
        if (attackStatus === AttackStatus.killed) {
            if (nextGameUser?.gameBoard.ifAllShipsAreDead())
                this.setGameWinner(game, gameUser);
        }
        if (!game.winner) {
            if (attackStatus === AttackStatus.miss)
                game.currentPlayer = nextGameUser;
        }
        return {
            attackStatus,
            gameOver: game.winner ? true : false,
        };
    }

    public deleteNonAliveUsers(lastAliveDate: Date) {
        this.lock.acquire();
        try {
            for (let i = 0; i < this.users.length; i++) {
                const user = this.users[i];
                if (!user.isAlive && user.lastRequestDateTime <= lastAliveDate)
                    this.users.splice(i, 1);
            }
        } finally {
            this.lock.release();
        }
    }
}

export default DB;

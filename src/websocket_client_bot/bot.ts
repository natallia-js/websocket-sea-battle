import { Position, Ship, ShipType } from '@db/dto';

type ShipConfiguration = {
    maxShips: number,
    pointCount: number,
    type: ShipType,
}

class Bot {
    private userId: string = '';
    private roomId: string = '';
    private gameId: string = '';
    private playerId: string = '';

    private gameFieldBorderX = ['A','B','C','D','E','F','G','H','I','J'];
    private gameFieldBorderY = ['1','2','3','4','5','6','7','8','9','10'];
    private shipsConfiguration: ShipConfiguration[] = [
        { maxShips: 1, pointCount: 4, type: ShipType.huge },
        { maxShips: 2, pointCount: 3, type: ShipType.large },
        { maxShips: 3, pointCount: 2, type: ShipType.medium },
        { maxShips: 4, pointCount: 1, type: ShipType.small },
    ];

    private _hitsForWin = 0;

    private CELL_WITH_SHIP = 1;
    private CELL_EMPTY = 0;

    constructor(userId: string = '') {
        this.userId = userId;
        for (let i = 0; i < this.shipsConfiguration.length; i++) {
            this._hitsForWin = +this._hitsForWin + (this.shipsConfiguration[i].maxShips*this.shipsConfiguration[i].pointCount);
        }
        this.generateShotMap(); 
    }

    public setUserId(value: string) {
        this.userId = value;
    }

    public getUserId() {
        return this.userId;
    }

    public setRoomId(value: string) {
        this.roomId = value;
        this.addedToRoom = true;
    }

    public getRoomId() {
        return this.roomId;
    }

    public setGameId(value: string) {
        this.gameId = value;
    }

    public getGameId() {
        return this.gameId;
    }

    public setPlayerId(value: string) {
        this.playerId = value;
    }

    public getPlayerId() {
        return this.playerId;
    }
    
    public addedToRoom: boolean = false;
    public ships: Ship[] = [];
    public map: number[][] = [];
    private shotMap: Position[] = [];

    /**
     * Генерирует массив содержащий информацию о том есть или нет корабли
     */
    public generateRandomShipMap() {
        // генерация карты расположения, включающей отрицательный координаты
        // для возможности размещения у границ
        for (let yPoint = -1; yPoint < (this.gameFieldBorderY.length + 1); yPoint++) {
            for (let xPoint = -1; xPoint < (this.gameFieldBorderX.length + 1); xPoint++) {
                if (!this.map[yPoint]) {
                    this.map[yPoint] = [];
                }
                this.map[yPoint][xPoint] = this.CELL_EMPTY;
            }
        }
        // получение копии настроек кораблей для дальнейших манипуляций
        const shipsConfiguration = JSON.parse(JSON.stringify(this.shipsConfiguration));
        let allShipsPlaced = false;
        while (allShipsPlaced === false){
            let xPoint = this.getRandomInt(0, this.gameFieldBorderX.length);
            let yPoint = this.getRandomInt(0, this.gameFieldBorderY.length);
            if (this.isPointFree(this.map, xPoint, yPoint) === true) {
                if (this.canPutHorizontal(this.map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderX.length)) {
                    this.ships.push(new Ship({ x: xPoint, y: yPoint }, false, shipsConfiguration[0].pointCount, shipsConfiguration[0].type));
                    for (let i = 0; i < shipsConfiguration[0].pointCount; i++) {
                        this.map[yPoint][xPoint + i] = this.CELL_WITH_SHIP;
                    }
                } else if (this.canPutVertical(this.map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderY.length)) {
                    this.ships.push(new Ship({ x: xPoint, y: yPoint }, true, shipsConfiguration[0].pointCount, shipsConfiguration[0].type));
                    for (let i = 0; i < shipsConfiguration[0].pointCount; i++) {
                        this.map[yPoint + i][xPoint] = this.CELL_WITH_SHIP;
                    }
                } else {
                    continue;
                }
                // обновление настроек кораблей, если цикл не был пропущен
                // и корабль, стало быть, расставлен
                shipsConfiguration[0].maxShips--;
                if (shipsConfiguration[0].maxShips < 1){
                    shipsConfiguration.splice(0, 1);
                }
                if (shipsConfiguration.length === 0){
                    allShipsPlaced = true;
                }
            }
        }
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Проверка, возможно ли разместить тут однопалубный корабль
     */
    private isPointFree(map: number[][], xPoint: number, yPoint: number): boolean {
        // текущая и далее по часовй стрелке вокруг
        if (map[yPoint][xPoint] === this.CELL_EMPTY
            && map[yPoint-1][xPoint] === this.CELL_EMPTY
            && map[yPoint-1][xPoint+1] === this.CELL_EMPTY
            && map[yPoint][xPoint+1] === this.CELL_EMPTY
            && map[yPoint+1][xPoint+1] === this.CELL_EMPTY
            && map[yPoint+1][xPoint] === this.CELL_EMPTY
            && map[yPoint+1][xPoint-1] === this.CELL_EMPTY
            && map[yPoint][xPoint-1] === this.CELL_EMPTY
            && map[yPoint-1][xPoint-1] === this.CELL_EMPTY
        ) {
            return true;
        }
        return false;
    }

    /**
     * Возможность вставки корабля горизонтально
     */
    private canPutHorizontal(map: number[][], xPoint: number, yPoint: number, shipLength: number, coordLength: number) {
        let freePoints = 0;
        for (let x = xPoint; x < coordLength; x++) {
            // текущая и далее по часовй стрелке в гориз направл
            if (map[yPoint][x] === this.CELL_EMPTY
                && map[yPoint-1][x] === this.CELL_EMPTY
                && map[yPoint-1][x+1] === this.CELL_EMPTY
                && map[yPoint][x+1] === this.CELL_EMPTY
                && map[yPoint+1][x+1] === this.CELL_EMPTY
                && map[yPoint+1][x] === this.CELL_EMPTY
            ) {
                freePoints++;
            } else {
                break;
            }
        }
        return freePoints >= shipLength;
    }

    /**
     * Возможно ли вставить корабль вертикально
     */
    private canPutVertical(map: number[][], xPoint: number, yPoint: number, shipLength: number, coordLength: number) {
        let freePoints = 0;
        for (let y = yPoint; y < coordLength; y++) {
            // текущая и далее по часовй стрелке в вертикальном направлении
            if (map[y][xPoint] === this.CELL_EMPTY
                && map[y+1][xPoint] === this.CELL_EMPTY
                && map[y+1][xPoint+1] === this.CELL_EMPTY
                && map[y+1][xPoint] === this.CELL_EMPTY
                && map[y][xPoint-1] === this.CELL_EMPTY
                && map[y-1][xPoint-1] === this.CELL_EMPTY
            ) {
                freePoints++;
            } else {
                break;
            }
        }
        return freePoints >= shipLength;
    }

    /**
     * Создает масив с координатами полей, из которых компьютер
     * случайно выбирает координаты для обстрела
     */
    private generateShotMap() {
        for (let yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
            for (let xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
                this.shotMap.push({ y: yPoint, x: xPoint });
            }
        }
    }

    private shot: Position | null = null;

    public getShot() {
        return this.shot;
    }

    /**
     * Выстрел компьютера
     */
    public fire(){
        // берется случайный выстрел из сгенерированной ранее карты
        const randomShotIndex = this.getRandomInt(0, this.shotMap.length);
        this.shot = this.shotMap[randomShotIndex];
        // удаление чтобы не было выстрелов повторных
        this.shotMap.splice(randomShotIndex, 1);
        return this.shot;
    }
}

export default Bot;

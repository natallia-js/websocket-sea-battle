import DB from '@db/index';
import { UserMessage } from '@websocket_server/dto';
import { Ship } from '@db/dto';

function processAddShipsMessage(userMessage: UserMessage, db: DB) {
    const userGameData = JSON.parse(userMessage?.data) || {};
    const userShips = userGameData.ships?.map((shipData: any) => {
        return new Ship(shipData.position, shipData.direction, shipData.length, shipData.type);
    });
    const gameId = db.addUserShips(userGameData.gameId, userGameData.indexPlayer, userShips);
    return gameId;
}

export default processAddShipsMessage;

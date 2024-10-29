import { ServerMessageTypes } from '@websocket_server/dto';
import DB from '@db/index';
import { Position, AttackStatus } from '@db/dto';

function sendAttackMessages(gameId: string, playerId: string, position: Position, status: AttackStatus, db: DB) {
    const game = db.getGame(gameId);
    if (!game) return;
    game.users.forEach(user => {
        const messageToUser = {
            type: ServerMessageTypes.attack,
            data: JSON.stringify({
                position,
                currentPlayer: playerId, // player that made a shot
                status,
            }),
            id: 0,
        };
        if (user.ws)
            user.ws.send(JSON.stringify(messageToUser));
        console.log(`Sending message:\r\n${JSON.stringify(messageToUser)}`);
    });
}

export default sendAttackMessages;

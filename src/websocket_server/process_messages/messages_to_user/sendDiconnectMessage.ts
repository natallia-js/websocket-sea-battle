import { ServerMessageTypes } from '@websocket_server/dto';
import DB from '@db/index';

function sendDiconnectMessage(disconnectedUserId: string, db: DB) {
    const game = db.getUserGame(disconnectedUserId);
    if (!game) return;
    game.users.forEach(user => {
        if (user.id === disconnectedUserId)
            return;
        const messageToUser = {
            type: ServerMessageTypes.diconnect,
            id: 0,
        };
        if (user.ws)
            user.ws.send(JSON.stringify(messageToUser));
        console.log(`Sending message:\r\n${JSON.stringify(messageToUser)}`);
    });
}

export default sendDiconnectMessage;

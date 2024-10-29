import WebSocket from 'ws';
import { ServerMessageTypes } from '@websocket_server/dto';
import DB from '@db/index';

function sendRegMessage(userId: string, db: DB, ws: WebSocket) {
    const messageToUser = {
        type: ServerMessageTypes.reg,
        data: {
            name: db.getUserLogin(userId),
            index: userId,
            error: false,
            errorText: '',
        },
        id: 0,
    };
    if (ws)
        ws.send(JSON.stringify(messageToUser));
    console.log(`Sending message:\r\n${JSON.stringify(messageToUser)}`);
}

export default sendRegMessage;

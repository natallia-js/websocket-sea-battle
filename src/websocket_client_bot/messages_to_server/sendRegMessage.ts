import WebSocket from 'ws';
import { UserMessageTypes } from '@websocket_server/dto';

function sendRegMessage(ws: WebSocket, playerId: string) {
    const messageToServer = {
        type: UserMessageTypes.reg,
        data: JSON.stringify({
            name: 'bot' + playerId.slice(0, 7),
            index: 'bot' + playerId,
        }),
        id: 0,
    };
    if (ws)
        ws.send(JSON.stringify(messageToServer));
    console.log(`Sending message to server from Bot:\r\n${JSON.stringify(messageToServer)}`);
}

export default sendRegMessage;

import WebSocket from 'ws';
import { UserMessageTypes } from '@websocket_server/dto';
import Bot from '../bot';

function sendAddUserToRoomMessage(bot: Bot, ws: WebSocket) {
    if (!bot) return;
    const messageToServer = {
        type: UserMessageTypes.add_user_to_room,
        data: JSON.stringify({ indexRoom: bot.getRoomId() }),
        id: 0,
    };
    if (ws)
        ws.send(JSON.stringify(messageToServer));
    console.log(`Sending message to server from Bot:\r\n${JSON.stringify(messageToServer)}`);
}

export default sendAddUserToRoomMessage;

import WebSocket from 'ws';
import { ServerMessage } from '@websocket_server/dto';
import Bot from '../bot';
import sendAddUserToRoomMessage from '../messages_to_server/sendAddUserToRoomMessage';

function processUpdateRoomMessage(bot: Bot, message: ServerMessage, socket: WebSocket) {
    const serverMessageData = message?.data;
    const roomId = serverMessageData[0].roomId;
    if (bot && !bot.getRoomId()) {
        bot?.setRoomId(roomId);
        sendAddUserToRoomMessage(bot, socket);
    }
}

export default processUpdateRoomMessage;

import WebSocket from 'ws';
import { ServerMessage } from '@websocket_server/dto';
import Bot from '../bot';
import sendAttackMessage from '../messages_to_server/sendAttackMessage';

function processTurnMessage(bot: Bot, message: ServerMessage, socket: WebSocket) {
    const serverMessageData = JSON.parse(message?.data);
    const currentPlayer = serverMessageData.currentPlayer;
    if (currentPlayer === bot.getPlayerId()) {
        bot.fire();
        sendAttackMessage(bot, socket);
    }
}

export default processTurnMessage;

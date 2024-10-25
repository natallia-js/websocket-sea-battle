import { ServerMessage } from '@websocket_server/dto';
import Bot from '../bot';

function processCreateGameMessage(bot: Bot, message: ServerMessage) {
    const serverMessageData = message?.data;
    const gameId = serverMessageData.idGame;
    const playerId = serverMessageData.idPlayer;
    bot.setGameId(gameId);
    bot.setPlayerId(playerId);
}

export default processCreateGameMessage;

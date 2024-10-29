import WebSocket from 'ws';
import { UserMessageTypes } from '@websocket_server/dto';
import Bot from '../bot';
import { Position } from '@db/dto';

function sendAttackMessage(bot: Bot, ws: WebSocket) {
    const shot: Position | null = bot?.getShot();
    if (!shot) return;
    const messageToServer = {
        type: UserMessageTypes.attack,
        data: JSON.stringify({
            gameId: bot.getGameId(),
            x: shot.x,
            y: shot.y,
            indexPlayer: bot.getPlayerId(),
        }),
        id: 0,
    };
    if (ws)
        ws.send(JSON.stringify(messageToServer));
    console.log(`Sending message to server from Bot:\r\n${JSON.stringify(messageToServer)}`);
}

export default sendAttackMessage;

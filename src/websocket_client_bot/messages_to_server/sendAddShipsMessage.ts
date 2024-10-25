import WebSocket from 'ws';
import { UserMessageTypes } from '@websocket_server/dto';
import Bot from '../bot';

function sendAddShipsMessage(bot: Bot, ws: WebSocket) {
    const messageToServer = {
        type: UserMessageTypes.add_ships,
        data: JSON.stringify({
            gameId: bot.getGameId(),
            ships: bot.ships.map(ship => ({
                position: {
                    x: ship.getPosition().x,
                    y: ship.getPosition().y,
                },
                direction: ship.getDirection(),
                length: ship.getLength(),
                type: ship.getType(),
            })),
            indexPlayer: bot.getPlayerId(),
        }),
        id: 0,
    };
    if (ws)
        ws.send(JSON.stringify(messageToServer));
    console.log(`Sending message to server from Bot:\r\n${JSON.stringify(messageToServer)}`);
}

export default sendAddShipsMessage;

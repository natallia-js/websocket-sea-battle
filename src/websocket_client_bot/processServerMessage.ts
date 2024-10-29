import WebSocket from 'ws';
import { ServerMessage, ServerMessageTypes} from '@websocket_server/dto';
import processUpdateRoomMessage from './messages_from_server/processUpdateRoomMessage';
import sendAddShipsMessage from './messages_to_server/sendAddShipsMessage';
import processCreateGameMessage from './messages_from_server/processCreateGameMessage';
import processTurnMessage from './messages_from_server/processTurnMessage';
import Bot from './bot';

function processServerMessage(serverMessage: any, socket: WebSocket, bot: Bot | null) {
    if (!serverMessage || !bot) return;
    const messageObject: ServerMessage = JSON.parse(serverMessage);
    switch (messageObject.type) {
        case ServerMessageTypes.reg:
            bot.setUserId(messageObject.data.index); // messageData.index - bot id
            break;
        case ServerMessageTypes.update_room:
            processUpdateRoomMessage(bot, messageObject, socket);
            break;
        case ServerMessageTypes.create_game:
            processCreateGameMessage(bot, messageObject);
            bot.generateRandomShipMap(); console.log(bot.map); console.log(bot.ships)
            sendAddShipsMessage(bot, socket);
            break;
        case ServerMessageTypes.turn:
            processTurnMessage(bot, messageObject, socket);
            break;
        case ServerMessageTypes.finish:
            socket.close();
            break;
        default:
            break;
    }
}

export default processServerMessage;

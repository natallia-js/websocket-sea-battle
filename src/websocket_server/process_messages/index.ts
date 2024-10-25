import WebSocket from 'ws';
import { UserMessageTypes, UserMessage, UserWSData } from '@websocket_server/dto';
import DB from '@db/index';
import processRegMessage from './messages_from_user/processRegMessage';
import sendRegMessage from './messages_to_user/sendRegMessage';
import sendUpdateWinnersMessages from './messages_to_user/sendUpdateWinnersMessages';
import sendUpdateRoomMessages from './messages_to_user/sendUpdateRoomMessages';
import processCreateRoomMessage from './messages_from_user/processCreateRoomMessage';
import processAddUserToRoomMessage from './messages_from_user/processAddUserToRoomMessage';
import sendCreateGameMessages from './messages_to_user/sendCreateGameMessages';
import processAddShipsMessage from './messages_from_user/processAddShipsMessage';
import sendStartGameMessages from './messages_to_user/sendStartGameMessages';
import processAttackMessage from './messages_from_user/processAttackMessage';
import sendTurnMessages from './messages_to_user/sendTurnMessages';
import sendFinishMessages from './messages_to_user/sendFinishMessages';
import sendAttackMessages from './messages_to_user/sendAttackMessages';
import processRandomAttackMessage from './messages_from_user/processRandomAttackMessage';
import { startBotWebsocket } from '@websocket_client_bot/index';

function processAttackResult(processAttackMessageResult: any, db: DB) {
    if (!processAttackMessageResult)
        return;
    sendAttackMessages(
        processAttackMessageResult.gameId,
        processAttackMessageResult.playerId, // player that made a shot
        processAttackMessageResult.position,
        processAttackMessageResult.attackStatus,
        db
    );
    if (!processAttackMessageResult.gameOver) {
        sendTurnMessages(processAttackMessageResult.gameId, db);
    } else {
        sendFinishMessages(processAttackMessageResult.gameId, db);
        sendUpdateWinnersMessages(db);
    }
}

function processUserMessage(userWSData: UserWSData, data: any, db: DB, ws: WebSocket) {
    const userMessage: UserMessage = JSON.parse(data.toString());
    console.log(`Received command \x1b[33m${userMessage.type}\x1b[0m from user at ${userWSData.getClientIP()} (id = ${userWSData.getUserID()})`);
    switch(userMessage.type) {
        case UserMessageTypes.reg:
            const userId = processRegMessage(userMessage, db, ws);
            if (!userId) return;
            userWSData.setUserID(userId);
            sendRegMessage(userId, db, ws);
            sendUpdateRoomMessages(db);
            sendUpdateWinnersMessages(db);
            break;
        case UserMessageTypes.create_room:
            processCreateRoomMessage(userWSData.getUserID(), db);
            sendUpdateRoomMessages(db);
            break;
        case UserMessageTypes.add_user_to_room:
            const roomId = processAddUserToRoomMessage(userWSData.getUserID(), userMessage, db);
            sendUpdateRoomMessages(db);
            sendCreateGameMessages(roomId, db);
            break;
        case UserMessageTypes.add_ships:
            const gameId = processAddShipsMessage(userMessage, db);
            if (!gameId)
                return;
            if (db.getGame(gameId)?.users.length === 2) {
                sendStartGameMessages(gameId, db);
                sendTurnMessages(gameId, db);
            }
            break;
        case UserMessageTypes.attack:
            const processAttackMessageResult = processAttackMessage(userMessage, db);
            processAttackResult(processAttackMessageResult, db);
            break;
        case UserMessageTypes.randomAttack:
            const processRandomAttackMessageResult = processRandomAttackMessage(userMessage, db);
            processAttackResult(processRandomAttackMessageResult, db);
            break;
        case UserMessageTypes.single_play:
            startBotWebsocket(userWSData.getUserID());
            processCreateRoomMessage(userWSData.getUserID(), db);
            sendUpdateRoomMessages(db);
            break;
        default:
            console.log(`Unknown user message type: \x1b[31m${userMessage.type}\x1b[0m`);
            break;
    }
}

export default processUserMessage;

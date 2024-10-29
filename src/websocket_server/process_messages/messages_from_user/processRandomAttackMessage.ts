import DB from '@db/index';
import { UserMessage, UserMessageTypes } from '@websocket_server/dto';
import processAttackMessage from './processAttackMessage';

// returns random number from 0 to max-1
function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function processRandomAttackMessage(userMessage: UserMessage, db: DB) {
    const userMessageData = JSON.parse(userMessage?.data) || {};
    const gameId = userMessageData.gameId;
    const playerId = userMessageData.indexPlayer;
    const randomX = getRandomInt(10);
    const randomY = getRandomInt(10);
    const message: UserMessage = {
        type: UserMessageTypes.attack,
        data: JSON.stringify({
            gameId,
            x: randomX,
            y: randomY,
            indexPlayer: playerId,
        }),
        id: 0,
    };
    return processAttackMessage(message, db);
}

export default processRandomAttackMessage;

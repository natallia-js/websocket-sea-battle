import WebSocket from 'ws';
import processServerMessage from './processServerMessage';
import sendRegMessage from './messages_to_server/sendRegMessage';
import Bot from './bot';

const WSS_PORT = process.env.WSS_PORT;

// playerId - the id of the real player to play with
export function startBotWebsocket(playerId: string) {
    let socket: WebSocket | null;
    let bot: Bot = new Bot();

    socket = new WebSocket(`ws://localhost:${WSS_PORT}`);

    socket.onopen = function() {
        console.log('Bot successfully created');
        if (socket)
            sendRegMessage(socket, playerId);
    };
    
    socket.onclose = function() {
        socket = null;
    };

    socket.onmessage = function(event) {
        console.log(`Bot received data: ${event.data}`);
        if (socket)
            processServerMessage(event.data, socket, bot);
    };

    socket.onerror = function(error) {
        console.log(`Bot socket error: ${error.message}`);
    };
}

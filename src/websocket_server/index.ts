import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import DB from '@db/index';
import processUserMessage from './process_messages/index';
import sendDiconnectMessage from './process_messages/messages_to_user/sendDiconnectMessage';
import sendUpdateRoomMessages from './process_messages/messages_to_user/sendUpdateRoomMessages';
import sendUpdateWinnersMessages from './process_messages/messages_to_user/sendUpdateWinnersMessages';
import { UserWSData } from './dto';

export const startWebSocketServer = (port: any) => {
    const webSocketServer = new WebSocketServer({
        port,
        clientTracking: true,
    });

    const db = new DB();

    setInterval(() => {
        const minutes = 1;
        db.deleteNonAliveUsers(new Date((new Date()).getTime() - minutes * 60000));
        sendUpdateWinnersMessages(db);
    }, 10000);

    webSocketServer.on('connection', (ws: WebSocket , req: IncomingMessage) => {
        const userWSData = new UserWSData(req.socket.remoteAddress, '');
        console.log(`New client connected from ${userWSData.getClientIP()}`);
        console.log(`Total number of clients is ${webSocketServer.clients.size}`);
       
        ws.on('message', (data: any) => {
            processUserMessage(userWSData, data, db, ws);
            db.setUserAlive(userWSData.getUserID());
        });

        ws.on('close', () => {
            sendDiconnectMessage(userWSData.getUserID(), db);
            db.setUserDisconnected(userWSData.getUserID());
            sendUpdateRoomMessages(db);
            sendUpdateWinnersMessages(db);
            console.log(`The client at ${userWSData.getUserID()} has disconnected`);
        });

        ws.on('onerror', (event: WebSocket.ErrorEvent) => {
            console.log(`Error occurred: ${event.message}`);
        });
    });
};



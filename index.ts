import { httpServer } from './src/http_server/index';
import { startWebSocketServer } from './src/websocket_server/index';

const HTTP_PORT = process.env.HTTP_PORT;

console.log(`Start static http server on port ${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);

const WSS_PORT = process.env.WSS_PORT;

console.log(`Start WebSocket server on port ${WSS_PORT}`);
startWebSocketServer(WSS_PORT);

import { WebSocketServer } from 'ws';
import * as PlayerManager from './PlayerHandler.js';

const wss = new WebSocketServer({port: 8888});


/**
 * PACKET STRUCTURE
 * TOTAL_LENGTH_IN_BYTES:PACKET_TYPE:EVERYTHING_GOES_HERE_RAW
 */

wss.on("connection", ws => {
    PlayerManager.connected(ws);
    console.log(`Client connected. (Player: ${PlayerManager.getPlayerListSize()})`);

    ws.on('message', (data) => {
        PlayerManager.handle(ws, wss, data.buffer);
    })

    ws.on("close", (code, reason) => {
        PlayerManager.remove(ws);
        console.log(`Client disconnected.\nCode: ${code}\nReason: ${reason}\n`);
    })
});

console.log("Waiting for connections.");

process.on('SIGINT', () => {
    process.exit(0);
});
import { WebSocketServer } from 'ws';
import * as PlayerManager from './PlayerHandler.js';

const wss = new WebSocketServer({port: 8888});

/**
 * The following codes are allowed by default but any other code will be invalid
 * **** USE BINARY FOR SENDING AND RECIEVING DATA. *******
 * 0x01 -> player requests to join
 * 0x02 -> player leaves
 * 0x03 -> error (DENY ENTRY)
 */

/**
 * PACKET STRUCTURE
 * TOTAL_LENGTH_IN_BYTES:PACKET_TYPE:EVERYTHING_GOES_HERE_RAW
 */

wss.on("connection", ws => {
    PlayerManager.connected(ws);
    console.log(`Client connected. (Player: ${PlayerManager.getPlayerListSize()})`);

    ws.on('message', (data) => {
        PlayerManager.handle(ws, data);
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
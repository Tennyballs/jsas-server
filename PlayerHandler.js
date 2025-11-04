import { WebSocket, WebSocketServer } from "ws";


/**
 * @typedef {{x: number, y: number}} Vec2
 */

/**
 * @typedef {{
 *     position: Vec2,
 *     velocity: Vec2,
 *     rotation: number,
 *     speed: number
 * }} PlayerData
 */

/**
 * @type {{ws: WebSocket, data: PlayerData}[]}
 */
let playerList = [];

let backlog = null;
let maxPlayers = null;


class PlayerData {
    constructor() {
        this.position = {x: null, y: null};
        this.velocity = {x: null, y: null};
        this.rotation = null;
        this.id = playerList.length;
    }
}

/**
 * @param {WebSocket} ws 
 */
export function connected(ws)
{
    if(playerList.length < maxPlayers || maxPlayers == null)
    {
        playerList.push({ws, data: new PlayerData()});
    } else {
        ws.close(1001, "Server is full.");
    }
}

/**
 * @param {WebSocket} client 
 */
export function remove(ws2)
{
    playerList = playerList.filter((ws1) => {return ws1.ws != ws2});
}

export function getPlayerListSize()
{
    return playerList.length;
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {WebSocketServer} wss 
 * @param {ArrayBuffer} data 
 */
export function handle(ws, wss, data)
{
    const buffer = new Buffer(data.slice(6))
    console.log(buffer.readFloatLE(1), buffer.readFloatLE(5));

    wss.clients.forEach(c => {
        c.send(buffer)
    })
}
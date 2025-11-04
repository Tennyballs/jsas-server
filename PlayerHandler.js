import { WebSocket } from "ws";

class PlayerData {
    constructor() {
        this.position = {x: null, y: null};
        this.velocity = {x: null, y: null};
        this.rotation = null;
    }
}

/**
 * @typedef {{x: number, y: number, z: number}} Vec3
 */

/**
 * @typedef {{
 *     position: Vec3,
 *     velocity: Vec3,
 *     rotation: Vec3,
 *     up: Vec3,
 *     gravity: number,
 *     speed: number
 * }} PlayerData
 */

/**
 * @type {{ws: WebSocket, data: PlayerData}[]}
 */
let playerList = [];

let backlog = null;
let maxPlayers = null;

function bytesToFloat32(byteArr, littleEndian = true) {
  // Create an ArrayBuffer of 4 bytes
  const buffer = new ArrayBuffer(4);
  // Create a DataView to manipulate the buffer
  const view = new DataView(buffer);

  // Set the bytes in the DataView
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, byteArr[i]);
  }

  // Read the 32-bit float from the DataView
  // The second argument specifies endianness (true for little-endian, false for big-endian)
  return view.getFloat32(0, littleEndian);
}

function bytesToFloat64(byteArr, littleEndian = true) {
  // Create an ArrayBuffer of 4 bytes
  const buffer = new ArrayBuffer(8);
  // Create a DataView to manipulate the buffer
  const view = new DataView(buffer);

  // Set the bytes in the DataView
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, byteArr[i]);
  }

  // Read the 32-bit float from the DataView
  // The second argument specifies endianness (true for little-endian, false for big-endian)
  return view.getFloat32(0, true);
}


//wrapper class
class BufferedArray {
    
    /**
     * @param {Uint8Array} array 
     */
    constructor(array) {
        this.index = 0;
        this.data = array;
    }

    readU8() // unsigned 8bit integer
    {
        if(this.index < this.data.length)
        {
            const data = this.data[this.index] & 0xFF;
            this.index++;
            return data;
        }
        return 0;
    }

    readU16() // unsigned 16bit integer
    {
        return this.readU8() << 8 | this.readU8();
    }

    readU32() // unsigned 32bit integer
    {
        return this.readU16() << 16 | this.readU16();
    }

    readU64() // unsigned 64bit integer
    {
        return this.readU32() << 32 | this.readU32();
    }

    readF32() // (float)
    {
        let arr = []
        for(let i=0;i<4;i++)
        {
            arr.push(this.readU8())
        }
        return bytesToFloat32(arr)
    }
    readF64() // (double)
    {
        let arr = []
        for(let i=0;i<8;i++)
        {
            arr.push(this.readU8())
        }
        return bytesToFloat64(arr)
    }
}


export function setMaxPlayers(n)
{
    maxPlayers = n;
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
 * @param {*} data 
 */
export function handle(ws, data)
{
    // console.log("recieved data");
    const buffer = new BufferedArray(data);
    // console.log(`x: ${buffer.readF32().toFixed(3)} | y: ${buffer.readF32().toFixed(3)}`);
    const i = playerList.findIndex((data) => {return data.ws == ws});
    const playerData = playerList[i].data;
    playerData.position.x = buffer.readF32();
    playerData.position.y = buffer.readF32();
    
    playerData.velocity.x = buffer.readF32();
    playerData.velocity.y = buffer.readF32();

    playerData.rotation = buffer.readF32();

    console.log(playerData);

    // ws.send([])
}
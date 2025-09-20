import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import {SECRET_KEY} from "@repo/be-common/config"


const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    return null;
  }
  return null;
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); 
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      if (user && !user.rooms.includes(parsedData.roomId)) {
        user.rooms.push(parsedData.roomId);
        console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
      console.log(`User ${user.userId} left room ${parsedData.roomId}`);
    }

    console.log("message received:", parsedData.type);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "drawing_update") {
      const roomId = parsedData.roomId;
      const elements = parsedData.elements;
      const version = parsedData.version;

      users.forEach(user => {
        if (user.rooms.includes(roomId) && user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "drawing_update",
            roomId,
            elements,
            version,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "element_add") {
      const roomId = parsedData.roomId;
      const element = parsedData.element;

      users.forEach(user => {
        if (user.rooms.includes(roomId) && user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "element_add",
            roomId,
            element,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "element_update") {
      const roomId = parsedData.roomId;
      const element = parsedData.element;

      users.forEach(user => {
        if (user.rooms.includes(roomId) && user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "element_update",
            roomId,
            element,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "element_delete") {
      const roomId = parsedData.roomId;
      const elementId = parsedData.elementId;

      users.forEach(user => {
        if (user.rooms.includes(roomId) && user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "element_delete",
            roomId,
            elementId,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "cursor_position") {
      const roomId = parsedData.roomId;
      const cursor = parsedData.cursor;

      users.forEach(user => {
        if (user.rooms.includes(roomId) && user.ws !== ws) {
          user.ws.send(JSON.stringify({
            type: "cursor_position",
            roomId,
            cursor,
            userId: parsedData.userId
          }))
        }
      })
    }

    if (parsedData.type === "user_presence") {
      const roomId = parsedData.roomId;
      const user = users.find(x => x.ws === ws);
      
      if (user) {
        const roomUsers = users
          .filter(u => u.rooms.includes(roomId))
          .map(u => ({ userId: u.userId }));

        users.forEach(u => {
          if (u.rooms.includes(roomId)) {
            u.ws.send(JSON.stringify({
              type: "user_presence",
              roomId,
              users: roomUsers
            }))
          }
        })
      }
    }

  });
  ws.on('close', ()=>{
    const idx = users.findIndex(u=>u.ws ===ws);
    if(idx!=-1){
        users.splice(idx,1)
    }
  })
});
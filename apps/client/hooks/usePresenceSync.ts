"use client";

import { useEffect, useCallback, useState } from "react";
import useSocket  from "./useSocket";

interface PresenceUser {
  userId: string;
}

export function usePresence(token: string, roomId: string) {
    const { socket, isConnected } = useSocket({ token });
    const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

    const requestPresence = useCallback(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            type: "user_presence",
            roomId
        }));
    }, [socket, roomId]);

    useEffect(() => {
        if (!socket) return;
        socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "user_presence" && msg.roomId === roomId) {
            setOnlineUsers(msg.users);
        }
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (!isConnected) return;
        const interval = setInterval(requestPresence, 10000);
        return () => clearInterval(interval);
    }, [isConnected, requestPresence]);

    return { onlineUsers, requestPresence };
}

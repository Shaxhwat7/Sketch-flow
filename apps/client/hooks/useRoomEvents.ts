"use client";

import { useEffect, useState, useCallback } from "react";
import  useSocket  from "./useSocket";

interface RoomUser {
    userId: string;
}

interface UseRoomEventsProps {
    token: string;
    roomId: string;
}

export function useRoomEvents({ token, roomId }: UseRoomEventsProps) {

    const { socket, isConnected } = useSocket({ token });
    const [users, setUsers] = useState<RoomUser[]>([]);
    const [messages, setMessages] = useState<{ userId: string; message: string }[]>([]);

    useEffect(() => {

        if (!socket || !isConnected) return;

        socket.send(JSON.stringify({
            type: "join_room",
            roomId
        }));

        return () => {
            socket.send(JSON.stringify({
                type: "leave_room",
                roomId
            }));
        };
    }, [socket, isConnected, roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "user_presence":
                if (data.roomId === roomId) {
                    setUsers(data.users || []);
                }
                break;

                case "chat":
                if (data.roomId === roomId) {
                    setMessages((prev) => [...prev, { userId: data.userId, message: data.message }]);
                }
                break;

                default:
                break;
        }
        };
    }, [socket, roomId]);

    const sendMessage = useCallback(
        (message: string, userId: string) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            type: "chat",
            roomId,
            message,
            userId
        }));
        },
        [socket, roomId]
    );

    const requestPresence = useCallback(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            type: "user_presence",
            roomId
            }));
        }, [socket, roomId]);

    return {
        users,
        messages,
        sendMessage,
        requestPresence,
        isConnected,
    };
}

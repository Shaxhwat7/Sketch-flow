"use client";

import { useEffect, useCallback, useState } from "react";
import  useSocket  from "./useSocket";

interface CursorData {
    x: number;
    y: number;
    userId: string;
}

interface UseCursorSyncProps {
    token: string;
    roomId: string;
}

export function useCursorSync({ token, roomId }: UseCursorSyncProps) {
    const { socket, isConnected } = useSocket({ token });
    const [cursors, setCursors] = useState<Record<string, { x: number; y: number }>>({});

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "cursor_position" && msg.roomId === roomId) {
            setCursors((prev) => ({
            ...prev,
            [msg.userId]: msg.cursor,
            }));
        }
        };
    }, [socket, roomId]);

    const sendCursorPosition = useCallback(
        (cursor: { x: number; y: number }, userId: string) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            type: "cursor_position",
            roomId,
            cursor,
            userId,
        }));
        },
        [socket, roomId]
  );

    return { cursors, sendCursorPosition };
}

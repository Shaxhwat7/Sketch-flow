"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

interface SocketProviderProps {
    token: string;
    children: React.ReactNode;
}

export function SocketProvider({ token, children }: SocketProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!token) return;

        const wsUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
        console.log("Connected to WebSocket Server");
        setIsConnected(true);
        };

        ws.onclose = () => {
        console.log("Disconnected from WebSocket Server");
        setIsConnected(false);
        };

        ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
  }, [token]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
        {children}
        </SocketContext.Provider>
  );
}

export function useSocketContext() {
    return useContext(SocketContext);
}

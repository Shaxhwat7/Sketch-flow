"use client"

import { useCallback, useEffect } from "react";
import useSocket from "./useSocket";
import { Edu_SA_Beginner } from "next/font/google";

interface DrawingElement{
    id:string;
    type:string;
    data:any;
    version:number
}

interface useDrawingSyncProps{
    token:string;
    roomId:string;
    onElementUpdate:(elements: DrawingElement[])=>void;
}

export function useDrawingSync({token, roomId, onElementUpdate}:useDrawingSyncProps){
    const {socket, isConnected} = useSocket({token})

    useEffect(()=>{
        if(!socket || !isConnected) return;
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            if(msg.type==="drawing_update" && msg.roomId===roomId){
                onElementUpdate(msg.element)
            }
        }
    },[socket,isConnected,roomId,onElementUpdate])

    const sendDrawingUpdate = useCallback(
        (elements:DrawingElement[], version:number, userId:string)=>{
            if(!socket || socket.readyState!==WebSocket.OPEN)return;
            socket.send(JSON.stringify({
                type:"drawing_update",
                roomId,
                elements,
                version,
                userId
            }))
            },
        [socket,roomId]
    );
    return {sendDrawingUpdate, isConnected}
}   
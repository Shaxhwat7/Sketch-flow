import { useEffect, useRef, useState } from "react"

interface useSocketProp{
    token:string
}
export default function useSocket({token}:useSocketProp){
    const [isConnected, setisConnected] = useState(false)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(()=>{
        if(!token){
            return
        }
        const wsurl = `${process.env.NEXT_PUBLIC_SOCKET_URL}?token=${token}`
        const ws = new WebSocket(wsurl)

        socketRef.current = ws
        ws.onopen = () => {
            console.log("Socket connected")
            setisConnected(true)
        }

        ws.onclose = () => {
            console.log("socket disconnected")
            setisConnected(false)
        }
        ws.onclose = () => {
            console.error("websocket error")
        }
        return () => {
            ws.close()
        }
    },[token])
    const send = (data: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            socketRef.current.send(JSON.stringify(data))
        }
        else{
            console.warn("websocket not connected yets")
        }
    }
    const onMessage = (callback :(data:any) => void) => {
        if(!socketRef.current) return

        socketRef.current.onmessage = (event)=>{
            try{
                const msg = JSON.parse(event.data)
                callback(msg)
            }catch(e){
                console.error("error parsing")
            }
        }
    }

    return {
        socket:socketRef.current,
        isConnected,
        send,
        onMessage
    }
}
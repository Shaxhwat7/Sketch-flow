"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

{/*  useEffect(() => {
    if (!token) {
      router.push("/signin");
    }
  }, [token, router]);*/}

  useEffect(() => {
    if (!token) return;
    async function fetchRooms() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_BACKEND_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [token]);

  async function createRoom() {
    const roomName = prompt("Enter room name:");
    if (!roomName) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_BACKEND_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName }),
      });
      const data = await res.json();  
      if (res.ok) {
        alert("Room created successfully!");
        router.push(`/room/${data.roomId}`);
      } else {
        alert(data.message || "Failed to create room");
      }
    } catch (err) {
      console.error("Error creating room:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Your Rooms</h1>
        <button
          onClick={createRoom}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium"
        >
          + New Room
        </button>
      </header>

      {rooms.length === 0 ? (
        <p className="text-gray-400">You don’t have any rooms yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/room/${room.id}`)}
              className="bg-gray-900 hover:bg-gray-800 transition cursor-pointer rounded-xl p-5 border border-gray-800 hover:border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-2">{room.slug}</h2>
              <p className="text-gray-400 text-sm">
                {room.drawings?.[0]
                  ? `Version: ${room.drawings[0].version}`
                  : "No drawings yet"}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Created: {new Date(room.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-16 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} DrawTogether — All rights reserved.
      </footer>
    </div>
  );
}

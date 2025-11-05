"use client";

import Canvas from "@/components/Canvas";
import BottomBar from "@/components/BottomBar";
import Toolbar from "@/components/ToolBar";

export default function RoomPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar />

      <div className="flex-1 overflow-hidden relative">
        <Canvas />
      </div>

      <BottomBar />
    </div>
  );
}

export default function Toolbar() {
  return (
    <div className="h-16 w-full bg-white border-b border-gray-300 flex items-center px-6 gap-4 shadow-sm">
      <button className="p-2 hover:bg-gray-200 rounded" title="Select">🖱️</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Draw">✏️</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Rectangle">⬛</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Circle">⚪</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Text">🔤</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Eraser">🩹</button>

      <div className="flex-1" />
      <button className="p-2 hover:bg-gray-200 rounded" title="Undo">↩️</button>
      <button className="p-2 hover:bg-gray-200 rounded" title="Redo">↪️</button>
      <button className="p-2 hover:bg-gray-200 rounded bg-blue-500 text-white" title="Save">
        💾 Save
      </button>
    </div>
  );
}

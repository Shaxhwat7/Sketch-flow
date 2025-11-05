export default function BottomBar() {
  return (
    <div className="h-12 bg-white border-t border-gray-300 flex items-center justify-between px-6 text-sm text-gray-700">
      <div>Zoom: 100%</div>
      <div className="flex gap-4">
        <button className="hover:text-blue-500">Share</button>
        <button className="hover:text-blue-500">Export</button>
      </div>
    </div>
  );
}

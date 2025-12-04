import React from "react";
import { Plus } from "lucide-react";

export default function Stories() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
      
      {/* New Loop */}
      <div
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-300 flex items-center justify-center bg-white text-indigo-500">
          <Plus size={24} />
        </div>
        <span className="text-xs font-medium text-slate-600">New Loop</span>
      </div>

      {/* Mock Story Users */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-pink-500">
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}`}
                className="w-full h-full bg-white"
                alt={`User ${i}`}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600">User {i}</span>
        </div>
      ))}

    </div>
  );
}

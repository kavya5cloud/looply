// src/components/Stories.jsx
import React from "react";
import { Plus } from "lucide-react";

export default function Stories({ stories = [], onCreate, onOpenStory }) {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
      <div onClick={onCreate} className="flex flex-col items-center gap-1 cursor-pointer">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-300 flex items-center justify-center bg-white text-indigo-500">
          <Plus size={24} />
        </div>
        <span className="text-xs font-medium text-slate-600">New Story</span>
      </div>

      {stories.map((s) => (
        <div key={s.id} className="flex flex-col items-center gap-1">
          <div
            onClick={() => onOpenStory && onOpenStory(s)}
            className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-pink-500 cursor-pointer"
          >
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
              <img src={s.image} alt={`${s.user?.name || "story"}`} className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 truncate max-w-[64px]">{s.user?.name || "User"}</span>
        </div>
      ))}
    </div>
  );
}

import { Home, Search, BarChart2, User } from "lucide-react";

export default function BottomNav({ setPage }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex gap-8 border border-gray-200">
      <Home onClick={() => setPage("feed")} className="cursor-pointer w-6 h-6" />
      <Search className="cursor-pointer w-6 h-6" />
      <BarChart2 className="cursor-pointer w-6 h-6" />
      <User onClick={() => setPage("profile")} className="cursor-pointer w-6 h-6" />
    </div>
  );
}

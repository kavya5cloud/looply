import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserProfile } from "../services/user";

export default function Stories() {
  const [users, setUsers] = useState([]);

  // TEMP – static users for UI
  useEffect(() => {
    setUsers([
      { id: 1, name: "User 1", pic: "/default-avatar.png" },
      { id: 2, name: "User 2", pic: "/default-avatar.png" },
      { id: 3, name: "User 3", pic: "/default-avatar.png" },
      { id: 4, name: "User 4", pic: "/default-avatar.png" },
    ]);
  }, []);

  return (
    <div className="flex gap-6 px-4 py-4 items-center">
      {/* NEW LOOP */}
      <div className="flex flex-col items-center cursor-pointer">
        <div className="w-16 h-16 border-2 border-dashed border-purple-400 rounded-full flex items-center justify-center text-3xl text-purple-600">
          +
        </div>
        <p className="text-xs mt-1 text-gray-500">New Loop</p>
      </div>

      {/* USER STORIES */}
      {users.map((u) => (
        <div key={u.id} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-300 p-1">
            <img
              src={u.pic}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <p className="text-xs mt-1 text-gray-500">{u.name}</p>
        </div>
      ))}
    </div>
  );
}

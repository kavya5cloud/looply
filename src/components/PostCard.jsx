import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function PostCard({ post }) {
  const { content, likes = 0, mediaUrls = [] } = post;

  return (
    <div className="bg-white rounded-2xl shadow p-5 w-full max-w-xl mx-auto border border-gray-100 mb-6">
      {/* USER HEADER */}
      <div className="flex items-center gap-3">
        <img
          src="/default-avatar.png"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">Alex Rivera</p>
          <p className="text-gray-400 text-sm">@arivera • now</p>
        </div>
      </div>

      {/* TEXT */}
      <p className="mt-3 text-gray-900">{content}</p>

      {/* IMAGE (optional) */}
      {mediaUrls[0] && (
        <img
          src={mediaUrls[0]}
          className="rounded-xl mt-3"
        />
      )}

      {/* EARNINGS */}
      <div className="mt-3 text-sm text-gray-400 bg-gray-100 rounded-xl px-4 py-2 flex gap-3 items-center">
        <span className="text-purple-600 font-semibold">$0.00 earned</span>
        <span className="text-gray-400">|</span>
        <span>0 views</span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-6 mt-4 text-gray-500 text-sm items-center">
        <div className="flex items-center gap-1 cursor-pointer hover:text-red-400">
          <Heart className="w-5" /> {likes}
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-400">
          <MessageCircle className="w-5" /> 0
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
          <Share2 className="w-5" />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImage } from "../services/supabase";

// inline icon
function DollarSignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 1v22" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M17 5a4 4 0 00-8 0 4 4 0 008 0z"
        stroke="#059669"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CreatePost({
  user,
  profile = {},
  onClose = () => {},
  onPosted = () => {},
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  /** SELECT IMAGE */
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /** REMOVE IMAGE */
  const removeImage = () => {
    file && URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  /** SUBMIT POST */
  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setIsPosting(true);
    setError("");

    try {
      let imageURL = null;

      if (file) {
        const safeFile = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        imageURL = await uploadImage(file, `posts/${user.uid}/${safeFile}`);
        if (!imageURL) throw new Error("Image upload failed");
      }

      await addDoc(collection(db, "posts"), {
        user: {
          id: user.uid,
          name: profile?.name || user.displayName || "",
          avatar: profile?.avatar || user.photoURL || "",
        },
        content: text.trim(),
        image: imageURL,
        likes: [],
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: serverTimestamp(),
      });

      removeImage();
      setText("");
      onPosted();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 flex flex-col max-w-xl mx-auto shadow-xl">
      {/* HEADER */}
      <div className="relative flex items-center justify-center p-4 border-b border-slate-200">
        <button
          onClick={onClose}
          className="absolute left-4 p-2 rounded-full hover:bg-slate-100"
        >
          <X size={22} />
        </button>

        <h2 className="font-semibold text-lg">New Loop</h2>

        <button
          onClick={handleSubmit}
          disabled={isPosting || (!text.trim() && !file)}
          className="absolute right-4 px-4 py-2 bg-slate-900 text-white rounded-full disabled:opacity-50"
        >
          {isPosting ? <Loader2 className="animate-spin" size={16} /> : "Post"}
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex gap-4 items-start">
          <img
            src={profile?.avatar || user.photoURL || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover bg-slate-200"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's looping?"
            className="w-full min-h-[120px] resize-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
            autoFocus
          />
        </div>

        {/* IMAGE PREVIEW */}
        {preview && (
          <div className="relative mt-4 w-full max-w-md">
            <img
              src={preview}
              className="w-full max-h-[360px] rounded-xl object-cover"
              alt="preview"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            id="post-img-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => document.getElementById("post-img-input").click()}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2"
          >
            <ImageIcon size={18} />
            <span className="text-sm font-medium">Photo</span>
          </button>

          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-2">
            <DollarSignIcon />
            <span className="text-sm font-medium">Monetization</span>
          </div>
        </div>

        <span className="text-xs text-slate-500">Drafts are not saved</span>
      </div>
    </div>
  );
}

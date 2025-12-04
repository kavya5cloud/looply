import React, { useState } from "react";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImage } from "../services/supabase";


export default function CreatePost({ user, profile = {}, onClose = () => {}, onPosted = () => {} }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null; // require auth

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeImage = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return; // nothing to post
    setIsPosting(true);
    setError("");

    try {
      // 1) upload to Supabase (if file)
      let imageURL = null;
      if (file) {
        // safe filename with timestamp
        const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const path = `posts/${user.uid}/${safeName}`;
        imageURL = await uploadImage(file, path); // returns public URL or null
        if (!imageURL) throw new Error("Image upload failed");
      }

      // 2) write post to Firestore
      const postsRef = collection(db, "posts");
      const postDoc = {
        user: {
          id: user.uid,
          name: profile?.name || user.displayName || "",
          avatar: profile?.avatar || user.photoURL || "",
        },
        content: text.trim(),
        image: imageURL || null,
        likes: [],
        comments: 0,
        shares: 0,
        earnings: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(postsRef, postDoc);

      // 3) cleanup & callbacks
      setText("");
      removeImage();
      onPosted();
      onClose();
    } catch (err) {
      console.error("CreatePost error:", err);
      setError(err.message || "Failed to post. Try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-50">
          <X size={20} />
        </button>
        <h2 className="font-bold text-lg">New Loop</h2>
        <button
          onClick={handleSubmit}
          disabled={isPosting || (!text.trim() && !file)}
          className="px-4 py-2 bg-slate-900 text-white rounded-full disabled:opacity-50"
        >
          {isPosting ? <Loader2 className="animate-spin" size={16} /> : "Post"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-5">
        <div className="flex gap-4">
          <img
            src={profile?.avatar || user.photoURL || "/default-avatar.png"}
            alt="me"
            className="w-10 h-10 rounded-full object-cover"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's looping in your mind?"
            className="w-full h-40 resize-none outline-none text-slate-800 placeholder:text-slate-400 text-lg"
            autoFocus
          />
        </div>

        {/* Image preview */}
        {preview && (
          <div className="relative mt-4 max-w-[420px]">
            <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-[360px]" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* hidden file input */}
          <input id="post-image-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => document.getElementById("post-image-input").click()}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2"
            aria-label="Add photo"
          >
            <ImageIcon size={18} />
            <span className="text-sm font-medium">Photo</span>
          </button>

          {/* Monetization toggle placeholder (implement later) */}
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-2">
            <DollarSignIcon />
            <span className="text-sm font-medium">Monetization</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">Drafts will not be saved</div>
      </div>
    </div>
  );
}

// small inline icon for dollar (to avoid importing extra lucide icon)
function DollarSignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M12 1v22" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5a4 4 0 00-8 0 4 4 0 008 0z" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

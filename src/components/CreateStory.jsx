// src/components/CreateStory.jsx
import React, { useState } from "react";
import { X, Camera, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreateStory({ onClose, onUpload, uploading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const pick = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="text-white p-2 rounded-full"><X size={28} /></button>
        <h3 className="text-white font-bold">Create Story</h3>
        <button
          onClick={() => onUpload(file)}
          disabled={!file || uploading}
          className="px-4 py-2 bg-white/20 text-white rounded-full disabled:opacity-50"
        >
          {uploading ? <Loader2 className="animate-spin" /> : "Post"}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="preview" className="max-h-[80vh] rounded-lg" />
        ) : (
          <div className="flex flex-col items-center text-white/70">
            <Camera size={80} />
            <p className="mt-4">Tap to add a photo</p>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-center">
        <label className="bg-white/10 text-white px-6 py-3 rounded-full cursor-pointer">
          <ImageIcon size={18} /> Choose Image
          <input accept="image/*" type="file" onChange={pick} className="hidden" />
        </label>
      </div>
    </div>
  );
}

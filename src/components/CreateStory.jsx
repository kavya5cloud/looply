import React, { useState } from "react";
import { X, Camera, Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreateStory({ onClose, onUpload, uploading }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleChooseImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (!imageFile) return;
    onUpload(imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <button onClick={onClose} className="text-white p-2 rounded-full">
          <X size={28} />
        </button>

        <h2 className="text-white text-lg font-bold">Create Story</h2>

        <button
          onClick={handleUpload}
          disabled={!imageFile || uploading}
          className="px-4 py-2 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="animate-spin" /> : "Post"}
        </button>
      </div>

      {/* Story Preview / Empty State */}
      <div className="flex-1 flex items-center justify-center">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="story"
            className="max-h-[80vh] rounded-xl shadow-xl"
          />
        ) : (
          <div className="flex flex-col items-center text-white opacity-60">
            <Camera size={80} />
            <p className="mt-4 text-xl font-light">Add a photo to your story</p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="p-6 flex justify-center">
        <label className="cursor-pointer bg-white/20 hover:bg-white/30 transition text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2">
          <ImageIcon size={20} />
          Choose Image
          <input type="file" className="hidden" accept="image/*" onChange={handleChooseImage} />
        </label>
      </div>
    </div>
  );
}

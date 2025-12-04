// src/services/supabase.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Upload any image file to bucket
export const uploadImage = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from("looply-media")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: publicURL } = supabase.storage
      .from("looply-media")
      .getPublicUrl(path);

    return publicURL.publicUrl;

  } catch (e) {
    console.error("Supabase Upload Error:", e);
    return null;
  }
};

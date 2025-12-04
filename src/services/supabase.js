import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export async function uploadImage(file, path) {
  try {
    // 1. Upload file
    const { error: uploadError } = await supabase.storage
      .from("looply-media")
      .upload(path, file, {
        upsert: true, // allow replacing same filename
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: publicURL } = supabase.storage
      .from("looply-media")
      .getPublicUrl(path);

    if (!publicURL?.publicUrl) throw new Error("Failed to get public URL");

    return publicURL.publicUrl;
  } catch (err) {
    console.error("Supabase Upload Error:", err.message);
    return null;
  }
}

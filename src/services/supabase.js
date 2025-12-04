import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export async function uploadImage(file, path) {
  try {
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("looply-media")
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicURL } = supabase.storage
      .from("looply-media")
      .getPublicUrl(path);

    if (!publicURL?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    return publicURL.publicUrl;
  } catch (err) {
    console.error("Supabase Upload Error:", err.message);
    return null;
  }
}

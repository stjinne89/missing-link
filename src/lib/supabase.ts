import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AVATARS_BUCKET = "avatars";

/** Build the public URL for an avatar image */
export function getAvatarUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${AVATARS_BUCKET}/${path}`;
}

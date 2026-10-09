import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が未設定のときは null。そのときは data.js のサンプルを表示します
export const supabase = url && key ? createClient(url, key) : null;

import { supabase } from "./supabase";
import { event as sampleEvent, bands as sampleBands } from "../data";

const WD = ["日", "月", "火", "水", "木", "金", "土"];
const WDE = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// "2026-11-22" から表示用の日付文字列を作る
export function dateFields(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y) return { dateLabel: "", weekday: "", date: "" };
  const w = new Date(y, m - 1, d).getDay();
  return {
    dateLabel: `${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`,
    weekday: `${WDE[w]} ${y}`,
    date: `${y}年${m}月${d}日(${WD[w]})`,
  };
}
const withDates = (e) => ({ ...e, ...dateFields(e.eventDate) });

const eventFromRow = (r) => withDates({
  id: r.id, slug: r.slug, title: r.title, description: r.description || "", eventDate: r.event_date,
  open: r.open_time || "", start: r.start_time || "", venue: r.venue || "", address: r.address || "",
  mapUrl: r.map_url || "", ticket: r.ticket || "", flyer: r.flyer_url || "", notes: r.notes || [],
  email: r.contact_email || "", published: Boolean(r.published),
  theme: { color: r.theme_color || "dusk", font: r.theme_font || "mincho" },
});
const bandFromRow = (b, i) => ({
  id: b.id, name: b.name, description: b.description || "", image: b.image_url || "",
  youtubeUrl: b.youtube_url || "", links: b.links || [], tone: (205 + i * 47) % 360,
});

const SAMPLE_ID = "sample";
const sampleData = () => ({
  event: withDates({ ...sampleEvent, id: SAMPLE_ID, published: true }),
  bands: sampleBands.map((b) => ({ ...b, image: b.image || "", links: b.links || [], youtubeUrl: b.youtubeUrl || "" })),
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 公開側：公開中のイベント一覧(開催日の昇順)。Supabase未設定ならサンプル1件
export async function fetchPublishedEvents() {
  if (!supabase) return [sampleData().event];
  const { data, error } = await supabase.from("events").select("*").eq("published", true).order("event_date", { ascending: true });
  if (error) throw error;
  return data.map(eventFromRow);
}

// 管理側：すべてのイベント(非公開を含む)、新しい日付が上
export async function fetchAdminEvents() {
  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
  if (error) throw error;
  return data.map(eventFromRow);
}

// 1イベントと、そのイベントの出演者。key は id(uuid) か slug。見つからなければ null
export async function fetchEventDetail(key, { admin = false } = {}) {
  if (!supabase) return key === SAMPLE_ID ? sampleData() : null;
  let q = supabase.from("events").select("*, bands(*)").eq(UUID.test(key) ? "id" : "slug", UUID.test(key) ? key : key.toLowerCase());
  if (!admin) q = q.eq("published", true);
  const { data, error } = await q.limit(1);
  if (error) throw error;
  if (!data.length) return null;
  const bands = [...(data[0].bands || [])].sort((a, b) => a.position - b.position).map(bandFromRow);
  return { event: eventFromRow(data[0]), bands };
}

// 新規イベントの初期値。DBが空のときだけサンプルを初期値にする。それ以外は直近イベントのメール・色・フォントを引き継ぐ
export async function newEventDraft() {
  const list = await fetchAdminEvents();
  if (!list.length) {
    const s = sampleData();
    return { event: { ...s.event, id: null, published: false }, bands: s.bands, prefilled: true };
  }
  const prev = list[0];
  return {
    event: withDates({
      id: null, title: "", description: "", eventDate: "", open: "", start: "", venue: "", address: "",
      mapUrl: "", ticket: "", flyer: "", notes: [], email: prev.email, theme: prev.theme, published: false,
    }),
    bands: [],
  };
}

// slugの重複(DBのunique制約違反)を分かりやすいメッセージにする
const slugDup = (error) => (error.code === "23505" ? new Error("この公開URL用IDはすでに別のイベントで使われています。別のIDにしてください。") : error);

// 保存。id があればそのイベントだけ更新、なければ新規レコードとして追加(他のイベントには触れない)
// 公開URL用ID(slug): 半角英小文字・数字・ハイフン、2〜40文字。UUIDと紛らわしい形は不可
export function slugError(s) {
  if (!s) return "";
  if (s.length < 2 || s.length > 40) return "公開URL用IDは2〜40文字で入力してください。";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return "公開URL用IDは半角の英小文字・数字・ハイフンのみ使えます(例: vol8)。";
  if (UUID.test(s)) return "このIDは使えません。";
  return "";
}
// 告知ページの公開URL(QRコードにも使用)。VITE_PUBLIC_URL を設定すればドメインを固定できます
export const publicBase = () => (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, "");
export const eventUrl = (e) => `${publicBase()}/#/e/${e.slug || e.id}`;

export async function saveEvent(ev, bands) {
  const slug = (ev.slug || "").trim();
  const row = {
    title: ev.title.trim(), description: ev.description, event_date: ev.eventDate,
    open_time: ev.open, start_time: ev.start, venue: ev.venue, address: ev.address,
    map_url: ev.mapUrl, ticket: ev.ticket, flyer_url: ev.flyer || null,
    notes: ev.notes.map((n) => n.trim()).filter(Boolean), contact_email: ev.email,
    theme_color: ev.theme.color, theme_font: ev.theme.font, published: Boolean(ev.published),
    ...(slug ? { slug } : {}),
  };
  let id = ev.id;
  if (id) {
    const { error } = await supabase.from("events").update(row).eq("id", id);
    if (error) throw slugDup(error);
  } else {
    const { data, error } = await supabase.from("events")
      .insert({ ...row, slug: slug || `e-${Date.now().toString(36)}` }).select("id").single();
    if (error) throw slugDup(error);
    id = data.id;
  }
  const rows = bands.map((b, i) => ({
    id: b.id || crypto.randomUUID(), event_id: id, position: i, name: b.name.trim(),
    description: b.description, image_url: b.image || null, youtube_url: b.youtubeUrl || null,
    links: (b.links || []).filter((l) => l.url.trim()),
  }));
  if (rows.length) {
    const { error } = await supabase.from("bands").upsert(rows);
    if (error) throw error;
  }
  // 削除は「このイベントの出演者のうち、フォームから外したもの」だけ
  let del = supabase.from("bands").delete().eq("event_id", id);
  if (rows.length) del = del.not("id", "in", `(${rows.map((r) => r.id).join(",")})`);
  const { error: e3 } = await del;
  if (e3) throw e3;
  return id;
}

// iPhoneの大きな写真を縮小してから Storage に保存し、公開URLを返す
async function resize(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
}
export async function uploadImage(file) {
  const blob = await resize(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("event-images")
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
}

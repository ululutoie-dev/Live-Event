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
  id: r.id, title: r.title, description: r.description || "", eventDate: r.event_date,
  open: r.open_time || "", start: r.start_time || "", venue: r.venue || "", address: r.address || "",
  mapUrl: r.map_url || "", ticket: r.ticket || "", flyer: r.flyer_url || "", notes: r.notes || [],
  email: r.contact_email || "", theme: { color: r.theme_color || "dusk", font: r.theme_font || "mincho" },
});
const bandFromRow = (b, i) => ({
  id: b.id, name: b.name, description: b.description || "", image: b.image_url || "",
  youtubeUrl: b.youtube_url || "", links: b.links || [], tone: (205 + i * 47) % 360,
});

// 一番新しい日付のイベントを1件取得(公開側はRLSにより公開済みのみ見える)
export async function fetchEvent() {
  const sample = {
    event: withDates({ ...sampleEvent, id: null }),
    bands: sampleBands.map((b) => ({ ...b, links: b.links || [], youtubeUrl: b.youtubeUrl || "" })),
  };
  if (!supabase) return { source: "sample", ...sample };
  const { data, error } = await supabase
    .from("events").select("*, bands(*)").order("event_date", { ascending: false }).limit(1);
  if (error) throw error;
  if (!data.length) return { source: "empty", ...sample };
  const row = data[0];
  const bands = [...(row.bands || [])].sort((a, b) => a.position - b.position).map(bandFromRow);
  return { source: "db", event: eventFromRow(row), bands };
}

export async function saveEvent(ev, bands) {
  const row = {
    title: ev.title.trim(), description: ev.description, event_date: ev.eventDate,
    open_time: ev.open, start_time: ev.start, venue: ev.venue, address: ev.address,
    map_url: ev.mapUrl, ticket: ev.ticket, flyer_url: ev.flyer || null,
    notes: ev.notes.map((n) => n.trim()).filter(Boolean), contact_email: ev.email,
    theme_color: ev.theme.color, theme_font: ev.theme.font, published: true,
  };
  let id = ev.id;
  if (id) {
    const { error } = await supabase.from("events").update(row).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("events")
      .insert({ ...row, slug: `e-${Date.now().toString(36)}` }).select("id").single();
    if (error) throw error;
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
  let del = supabase.from("bands").delete().eq("event_id", id);
  if (rows.length) del = del.not("id", "in", `(${rows.map((r) => r.id).join(",")})`);
  const { error: e3 } = await del;
  if (e3) throw e3;
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

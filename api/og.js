// /e/<slug> へのアクセスに、そのイベント専用のリンクプレビュー(OGP)を埋め込んで返す
// LINE・X・Facebook などのクローラーは JavaScript を実行せず、URLの「#」以降も見ないため、サーバー側で作ります
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const WD = ["日", "月", "火", "水", "木", "金", "土"];

function dateText(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  return y ? `${y}年${m}月${d}日(${WD[new Date(y, m - 1, d).getDay()]})` : "";
}

async function loadEvent(key) {
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!base || !anon || !/^[a-z0-9-]{2,64}$/i.test(key)) return { error: true };
  const col = UUID.test(key) ? "id" : "slug";
  const val = UUID.test(key) ? key : key.toLowerCase();
  const url = `${base}/rest/v1/events?${col}=eq.${encodeURIComponent(val)}&published=eq.true`
    + `&select=slug,title,description,event_date,venue,flyer_url,bands(image_url,position)&limit=1`;
  const r = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  if (!r.ok) return { error: true };
  const rows = await r.json();
  return rows.length ? { ev: rows[0] } : { missing: true };
}

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;
  const key = String(req.query?.slug || "").trim();
  let html;
  try {
    html = await (await fetch(`${origin}/index.html`)).text();
  } catch {
    res.status(500).send("読み込めませんでした。");
    return;
  }
  let status = 200;
  try {
    const { ev, missing } = await loadEvent(key);
    if (missing) status = 404;
    if (ev) {
      const firstBand = [...(ev.bands || [])].sort((a, b) => a.position - b.position).find((b) => b.image_url);
      const image = ev.flyer_url || firstBand?.image_url || `${origin}/ogp.jpg`;
      const line = (ev.description || "").split("\n")[0];
      const desc = [dateText(ev.event_date), ev.venue].filter(Boolean).join(" ｜ ") + (line ? ` ／ ${line}` : "");
      const pageUrl = `${origin}/e/${ev.slug || key}`;
      const tags = [
        `<title>${esc(ev.title)}</title>`,
        `<meta name="description" content="${esc(desc.slice(0, 120))}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(ev.title)}" />`,
        `<meta property="og:description" content="${esc(desc.slice(0, 120))}" />`,
        `<meta property="og:image" content="${esc(image)}" />`,
        `<meta property="og:url" content="${esc(pageUrl)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join("\n  ");
      html = html
        .replace(/<title>[\s\S]*?<\/title>/i, "")
        .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>\s*/gi, "")
        .replace("</head>", `  ${tags}\n</head>`);
    }
  } catch { /* 取得に失敗しても、通常のページはそのまま表示する */ }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.status(status).send(html);
}

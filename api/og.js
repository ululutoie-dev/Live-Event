// /e/<slug または UUID> へのアクセスに、そのイベント専用のリンクプレビュー(OGP)を埋め込んで返す
// LINE・X・Facebook などのクローラーは JavaScript を実行せず、URLの「#」以降も見ないため、サーバー側で作ります
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WD = ["日", "月", "火", "水", "木", "金", "土"];
const DEFAULT_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const clip = (s, n) => { const a = [...s]; return a.length > n ? a.slice(0, n - 1).join("") + "…" : s; };

function dateText(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  return y ? `${y}年${m}月${d}日(${WD[new Date(y, m - 1, d).getDay()]})` : "";
}

// クローラーが取得できる絶対URL(http/https)だけを返す。相対パスは公開URLを付け、それ以外は使わない
function absUrl(u, origin) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/") && !u.startsWith("//")) return origin + u;
  return "";
}

async function loadEvent(key) {
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!base || !anon || !/^[a-z0-9-]{2,64}$/i.test(key)) return { error: true };
  const col = UUID.test(key) ? "id" : "slug";
  const val = UUID.test(key) ? key : key.toLowerCase();
  // 公開中(published=true)のイベントだけを、必要な列だけ取得する(匿名キー。DB側のRLSも同じ条件)
  const url = `${base}/rest/v1/events?${col}=eq.${encodeURIComponent(val)}&published=eq.true`
    + `&select=slug,title,description,event_date,venue,flyer_url,bands(image_url,position)&limit=1`;
  const r = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: AbortSignal.timeout(5000) });
  if (!r.ok) return { error: true };
  const rows = await r.json();
  return rows.length ? { ev: rows[0] } : { missing: true };
}

export default async function handler(req, res) {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (!/^[a-z0-9.-]+(:\d+)?$/i.test(host)) { res.status(400).send("bad request"); return; }
  const selfOrigin = `https://${host}`;
  // OGPに書く公開URL。VITE_PUBLIC_URL があればそれを使い、なければアクセスされたドメイン
  const publicOrigin = (process.env.VITE_PUBLIC_URL || selfOrigin).replace(/\/$/, "");
  const key = String(req.query?.slug || "").trim();

  let html;
  try {
    const r = await fetch(`${selfOrigin}/index.html`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`index.html ${r.status}`);
    html = await r.text();
  } catch {
    res.status(500).send("読み込めませんでした。");
    return;
  }

  let status = 200;
  let cache = DEFAULT_CACHE;
  try {
    const { ev, missing, error } = await loadEvent(key);
    if (error) cache = "no-store"; // 一時的な失敗を長く保存しない(既定のプレビューのまま返す)
    if (missing) status = 404; // 非公開・存在しない: イベント情報は一切入れない
    if (ev) {
      const firstBand = [...(ev.bands || [])].sort((a, b) => a.position - b.position).find((b) => absUrl(b.image_url, publicOrigin));
      const image = absUrl(ev.flyer_url, publicOrigin) || absUrl(firstBand?.image_url, publicOrigin) || `${publicOrigin}/ogp.jpg`;
      const line = (ev.description || "").split("\n")[0].trim();
      const desc = clip([dateText(ev.event_date), ev.venue].filter(Boolean).join(" ｜ ") + (line ? ` ／ ${line}` : ""), 120);
      const pageUrl = `${publicOrigin}/e/${ev.slug || key}`;
      const tags = [
        `<title>${esc(ev.title)}</title>`,
        `<meta name="description" content="${esc(desc)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(ev.title)}" />`,
        `<meta property="og:description" content="${esc(desc)}" />`,
        `<meta property="og:image" content="${esc(image)}" />`,
        `<meta property="og:url" content="${esc(pageUrl)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join("\n  ");
      html = html
        .replace(/<title>[\s\S]*?<\/title>/i, "")
        .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>\s*/gi, "")
        .replace("</head>", () => `  ${tags}\n</head>`); // 関数で渡す(タイトル中の「$&」などを置換記号として解釈させない)
    }
  } catch {
    cache = "no-store"; // 取得に失敗しても、通常のページはそのまま表示する
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.status(status).send(html);
}

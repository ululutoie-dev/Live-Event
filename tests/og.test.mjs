import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import handler from "../api/og.js";

// ビルド後のindex.html相当(__SITE_URL__を置換したもの)
const template = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8").split("__SITE_URL__").join("https://live-event-red.vercel.app");
const HOST = "live-event-red.vercel.app";

function setup({ rows, restOk = true, restThrows = false, indexOk = true, env = {} } = {}) {
  process.env.VITE_SUPABASE_URL = "https://x.supabase.co";
  process.env.VITE_SUPABASE_ANON_KEY = "anon";
  delete process.env.VITE_PUBLIC_URL;
  for (const [k, v] of Object.entries(env)) { if (v === null) delete process.env[k]; else process.env[k] = v; }
  const calls = [];
  globalThis.fetch = async (u) => {
    u = String(u); calls.push(u);
    if (u.endsWith("/index.html")) return { ok: indexOk, status: indexOk ? 200 : 404, text: async () => template };
    if (restThrows) throw new Error("network");
    return { ok: restOk, status: restOk ? 200 : 500, json: async () => rows ?? [] };
  };
  return calls;
}
async function run(slug, { host = HOST } = {}) {
  const out = { headers: {} };
  const res = { setHeader: (k, v) => { out.headers[k] = v; }, status(c) { out.code = c; return this; }, send(b) { out.body = b; } };
  await handler({ headers: { host }, query: { slug } }, res);
  return out;
}
const head = (b) => b.match(/<head>[\s\S]*<\/head>/)[0];
const ev = (o = {}) => ({ slug: "vol8", title: "すこしだけそっと笑う人たち Vol.8", description: "秋の夜\n二行目", event_date: "2026-11-11", venue: "Shelter", flyer_url: "https://x.supabase.co/storage/v1/object/public/event-images/a.jpg", bands: [], ...o });

test("イベントのタイトル・日付・会場・画像・URLが入る", async () => {
  setup({ rows: [ev()] });
  const o = await run("vol8");
  const h = head(o.body);
  assert.equal(o.code, 200);
  assert.match(h, /<title>すこしだけそっと笑う人たち Vol\.8<\/title>/);
  assert.match(h, /og:title" content="すこしだけそっと笑う人たち Vol\.8"/);
  assert.match(h, /og:description" content="2026年11月11日\(水\) ｜ Shelter ／ 秋の夜"/);
  assert.match(h, /og:image" content="https:\/\/x\.supabase\.co\/storage\/v1\/object\/public\/event-images\/a\.jpg"/);
  assert.match(h, /og:url" content="https:\/\/live-event-red\.vercel\.app\/e\/vol8"/);
  assert.doesNotMatch(h, /LIVE EVENT/); // 既定のタグが残っていない
  assert.equal((o.body.match(/<title>/g) || []).length, 1);
  assert.equal((o.body.match(/property="og:title"/g) || []).length, 1);
});

test("クローラー向け: JavaScript不要で、本文(React用のroot)も一緒に返る", async () => {
  setup({ rows: [ev()] });
  const o = await run("vol8");
  assert.match(o.body, /<div id="root"><\/div>/);
  assert.equal(o.headers["Content-Type"], "text/html; charset=utf-8");
});

test("特殊文字・引用符・$記号でもタグが壊れない", async () => {
  setup({ rows: [ev({ title: `A&B "Live" <b>x</b> $& $' 'q'`, venue: `"会場"<>` })] });
  const o = await run("vol8");
  const h = head(o.body);
  assert.match(h, /og:title" content="A&amp;B &quot;Live&quot; &lt;b&gt;x&lt;\/b&gt; \$&amp; \$&#39; &#39;q&#39;"/);
  assert.equal((o.body.match(/<\/head>/g) || []).length, 1);
  assert.doesNotMatch(h, /<b>/);
});

test("画像: メインビジュアル → 最初の出演者(position順で写真があるもの) → ogp.jpg", async () => {
  setup({ rows: [ev({ flyer_url: null, bands: [{ position: 2, image_url: "https://i/B.jpg" }, { position: 0, image_url: null }, { position: 1, image_url: "https://i/A.jpg" }] })] });
  assert.match(head((await run("vol8")).body), /og:image" content="https:\/\/i\/A\.jpg"/);
  setup({ rows: [ev({ flyer_url: "", bands: [{ position: 0, image_url: "" }] })] });
  assert.match(head((await run("vol8")).body), /og:image" content="https:\/\/live-event-red\.vercel\.app\/ogp\.jpg"/);
});

test("画像URLは絶対URLだけ使う(相対は公開URLを付与、危険な形式は使わない)", async () => {
  setup({ rows: [ev({ flyer_url: "/flyer.jpg" })] });
  assert.match(head((await run("vol8")).body), /og:image" content="https:\/\/live-event-red\.vercel\.app\/flyer\.jpg"/);
  setup({ rows: [ev({ flyer_url: "javascript:alert(1)", bands: [] })] });
  assert.match(head((await run("vol8")).body), /og:image" content="https:\/\/live-event-red\.vercel\.app\/ogp\.jpg"/);
});

test("VITE_PUBLIC_URL があれば og:url / og:image がそのドメインで揃う", async () => {
  setup({ rows: [ev({ flyer_url: null })], env: { VITE_PUBLIC_URL: "https://example.com/" } });
  const h = head((await run("vol8")).body);
  assert.match(h, /og:url" content="https:\/\/example\.com\/e\/vol8"/);
  assert.match(h, /og:image" content="https:\/\/example\.com\/ogp\.jpg"/);
});

test("取得は公開中のみ。slugは小文字化、UUIDはidで検索", async () => {
  let calls = setup({ rows: [ev()] });
  await run("VOL8");
  const rest = calls.find((u) => u.includes("/rest/v1/events"));
  assert.match(rest, /slug=eq\.vol8&published=eq\.true/);
  assert.match(rest, /select=slug,title,description,event_date,venue,flyer_url,bands\(image_url,position\)/);
  calls = setup({ rows: [ev()] });
  await run("b77f212d-28f9-4da7-bcf6-411095c4732c");
  assert.match(calls.find((u) => u.includes("/rest/v1/events")), /id=eq\.b77f212d-28f9-4da7-bcf6-411095c4732c&published=eq\.true/);
});

test("存在しない/非公開: 404、イベント情報は入らず既定のタグのまま", async () => {
  setup({ rows: [] });
  const o = await run("secret");
  assert.equal(o.code, 404);
  assert.match(head(o.body), /LIVE EVENT/);
});

test("データ取得に失敗しても通常ページを返し、失敗はキャッシュしない", async () => {
  for (const opt of [{ restOk: false }, { restThrows: true }]) {
    setup(opt);
    const o = await run("vol8");
    assert.equal(o.code, 200);
    assert.match(head(o.body), /LIVE EVENT/);
    assert.equal(o.headers["Cache-Control"], "no-store");
  }
});

test("不正なIDではDBへ問い合わせない", async () => {
  const calls = setup({ rows: [ev()] });
  const o = await run("a b;drop table");
  assert.equal(calls.filter((u) => u.includes("/rest/v1/")).length, 0);
  assert.match(head(o.body), /LIVE EVENT/);
});

test("環境変数が未設定でも落ちない", async () => {
  const calls = setup({ rows: [ev()], env: { VITE_SUPABASE_URL: null, VITE_SUPABASE_ANON_KEY: null } });
  const o = await run("vol8");
  assert.equal(o.code, 200);
  assert.equal(calls.filter((u) => u.includes("/rest/v1/")).length, 0);
});

test("index.htmlが取れない/ホスト名が不正な場合", async () => {
  setup({ indexOk: false });
  assert.equal((await run("vol8")).code, 500);
  setup({ rows: [ev()] });
  assert.equal((await run("vol8", { host: "evil.com/x" })).code, 400);
});

test("説明は120文字以内、改行は1行目のみ使う", async () => {
  setup({ rows: [ev({ description: "あ".repeat(300) + "\n二行目" })] });
  const d = head((await run("vol8")).body).match(/og:description" content="([^"]*)"/)[1];
  assert.ok([...d].length <= 120);
  assert.doesNotMatch(d, /二行目/);
});

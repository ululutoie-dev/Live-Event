import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const html = read("index.html");
const meta = (key) => html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];
const SAMPLE = ["Night Signals", "三組の音", "YOUR-SITE", "2026.11.22", "SHELTER"]; // 初期開発時のサンプル由来の文字

test("index.html(クローラーが見る固定のOGP)に、初期サンプルのイベント名・文字が含まれない", () => {
  for (const s of SAMPLE) assert.equal(html.includes(s), false, `index.html に「${s}」が残っています`);
  for (const k of ["og:title", "og:description", "description"]) assert.ok(meta(k), `${k} がありません`);
  assert.doesNotMatch(html, /<title>[^<]*(Vol\.|Night)/);
});

test("og:image / og:url は同じドメインの絶対URLで、プレースホルダーが残っていない", () => {
  assert.equal(html.includes("__SITE_URL__"), false);
  assert.match(meta("og:image"), /^https:\/\/live-event-red\.vercel\.app\/ogp\.jpg$/);
  assert.match(meta("og:url"), /^https:\/\/live-event-red\.vercel\.app\/$/);
});

test("public/ogp.jpg は 1200x630 のJPEG(文字が入っていないことは目視で確認)", () => {
  const b = fs.readFileSync(new URL("public/ogp.jpg", root));
  assert.equal(b[0], 0xff); assert.equal(b[1], 0xd8);
  let i = 2, size = null;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) { size = [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; break; }
    i += 2 + b.readUInt16BE(i + 2);
  }
  assert.deepEqual(size, [1200, 630]);
});

test("public/ にサンプルの文字を含むテキストファイルがない", () => {
  for (const f of fs.readdirSync(new URL("public/", root))) {
    if (!/\.(html|txt|json|svg|xml)$/.test(f)) continue;
    const t = read(`public/${f}`);
    for (const s of SAMPLE) assert.equal(t.includes(s), false, `public/${f} に「${s}」`);
  }
});

test("サンプルデータ(src/data.js)を読み込むのは src/lib/api.js だけ", () => {
  const users = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.jsx?$/.test(f) && /from\s+"(\.\.?\/)+data"/.test(fs.readFileSync(p, "utf8"))) users.push(p.replaceAll("\\", "/"));
    }
  })(new URL("src/", root).pathname);
  assert.equal(users.length, 1);
  assert.match(users[0], /src\/lib\/api\.js$/);
});

test("制約の確認: URLの「#」以降はサーバーに届かない(どのイベントのURLでも、サーバーが受け取る要求は同じ)", () => {
  const target = (u) => { const x = new URL(u); return x.pathname + x.search; };
  const a = target("https://live-event-red.vercel.app/#/e/e-mv0yby2p");
  const b = target("https://live-event-red.vercel.app/#/e/vol8");
  assert.equal(a, "/");
  assert.equal(a, b);
});

test("Vercelの設定・ルーティングは変更していない(vercel.json と api/ を追加していない)", () => {
  assert.equal(fs.existsSync(new URL("vercel.json", root)), false);
  assert.equal(fs.existsSync(new URL("api/", root)), false);
  assert.equal(read("vite.config.js").includes("transformIndexHtml"), false);
});

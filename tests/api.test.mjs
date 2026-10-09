import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// src/lib/api.js をNodeで読めるように、Vite専用の部分だけ差し替えて読み込む(ロジックはそのまま)
const src = fs.readFileSync(new URL("../src/lib/api.js", import.meta.url), "utf8")
  .replace(/^import .*$/gm, "")
  .replaceAll("import.meta.env", "globalThis.__ENV");
const tmp = path.join(os.tmpdir(), `api-under-test-${process.pid}.mjs`);
fs.writeFileSync(tmp, "const supabase = null; const sampleEvent = {}; const sampleBands = [];\n" + src);
globalThis.window = { location: { origin: "https://live-event-red.vercel.app" } };
globalThis.__ENV = {};
const api = await import(tmp);

test("slugError: 公開URL用IDのルール", () => {
  assert.equal(api.slugError(""), "");
  assert.equal(api.slugError("vol8"), "");
  assert.equal(api.slugError("e-muwcz6sa"), "");
  for (const bad of ["a", "Vol8", "vol_8", "-vol", "vol-", "vo l", "a".repeat(41), "日本語", "b77f212d-28f9-4da7-bcf6-411095c4732c"]) {
    assert.notEqual(api.slugError(bad), "", `${bad} は不可のはず`);
  }
});

test("dateFields: 表示用の日付", () => {
  assert.deepEqual(api.dateFields("2026-11-11"), { dateLabel: "11.11", weekday: "WED 2026", date: "2026年11月11日(水)" });
  assert.deepEqual(api.dateFields(""), { dateLabel: "", weekday: "", date: "" });
});

test("eventUrl: ハッシュなしの /e/<slug> 形式。slugがなければid", () => {
  assert.equal(api.eventUrl({ slug: "vol8", id: "x" }), "https://live-event-red.vercel.app/e/vol8");
  assert.equal(api.eventUrl({ id: "b77f212d-28f9-4da7-bcf6-411095c4732c" }), "https://live-event-red.vercel.app/e/b77f212d-28f9-4da7-bcf6-411095c4732c");
  assert.doesNotMatch(api.eventUrl({ slug: "vol8" }), /#/);
});

test("publicBase: VITE_PUBLIC_URL があれば優先し、末尾の/は除く", () => {
  globalThis.__ENV = { VITE_PUBLIC_URL: "https://example.com/" };
  assert.equal(api.eventUrl({ slug: "vol8" }), "https://example.com/e/vol8");
  globalThis.__ENV = {};
});

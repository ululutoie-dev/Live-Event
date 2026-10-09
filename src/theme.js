/* ===== デザイン設定：カラー5種・フォント5種 ===== */
const NOISE_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>";
const CONCRETE_TEX = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}")`;
export const COLORS = {
  dusk:   { label: "ダスク",     bg: "#101419", surface: "#171d24", line: "#27303a", text: "#e4e9ee", muted: "#8b95a1", accent: "#9fb8c9", sub: "#bcc3ca", ph1: "#2c3d4d", ph2: "#131a21", g1: "#3b5266" },
  forest: { label: "フォレスト", bg: "#0e1512", surface: "#151e1a", line: "#25332d", text: "#e3e9e2", muted: "#86948b", accent: "#a8c3a0", sub: "#b9c4bc", ph1: "#2a4036", ph2: "#101a15", g1: "#35523f" },
  wine:   { label: "ワイン",     bg: "#171015", surface: "#20161c", line: "#33242d", text: "#efe4e6", muted: "#9a8b92", accent: "#d1a3a8", sub: "#c9b8bd", ph1: "#4a2a36", ph2: "#1b1016", g1: "#5a3342" },
  mono:   { label: "モノ",       bg: "#121212", surface: "#1b1b1b", line: "#2e2e2e", text: "#ececec", muted: "#8e8e8e", accent: "#c4c4c4", sub: "#bdbdbd", ph1: "#3a3a3a", ph2: "#161616", g1: "#404040" },
  paper:  { label: "ペーパー",   bg: "#efede8", surface: "#e4e1da", line: "#d2cfc7", text: "#1d2024", muted: "#6d737a", accent: "#3f6178", sub: "#454b52", ph1: "#c3ccd2", ph2: "#a9b3ba", g1: "#cfd8dd", light: true },
  beige:         { label: "ベージュ",       bg: "#e8dcc8", surface: "#dccfb7", line: "#c9bb9f", text: "#2e271f", muted: "#6b5f4d", accent: "#7a5a3a", sub: "#4a4034", ph1: "#cdbfa4", ph2: "#b5a688", g1: "#f0e7d6", light: true },
  concrete:      { label: "コンクリート",   bg: "#2d2e30", surface: "#38393c", line: "#4a4b4e", text: "#ecebe7", muted: "#a3a4a6", accent: "#cfcdc6", sub: "#cfcfcc", ph1: "#4b4c4f", ph2: "#2a2b2d", g1: "#505155", tex: CONCRETE_TEX },
  concreteLight: { label: "コンクリート 明", bg: "#c4c4c1", surface: "#b4b4b1", line: "#9f9f9c", text: "#1c1d1f", muted: "#58595b", accent: "#2b2d30", sub: "#34363a", ph1: "#aaaaa7", ph2: "#8d8d8a", g1: "#d3d3d0", light: true, tex: CONCRETE_TEX },
};
const KAKU = '"Zen Kaku Gothic New","Hiragino Sans","Yu Gothic",sans-serif';
export const FONTS = {
  mincho:  { label: "明朝",         d: '"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho",serif', b: KAKU, w: 700, l: 500 },
  gothic:  { label: "ゴシック",     d: KAKU, b: KAKU, w: 700, l: 500 },
  maru:    { label: "丸ゴシック",   d: '"Zen Maru Gothic","Hiragino Maru Gothic ProN",sans-serif', b: '"Zen Maru Gothic","Hiragino Maru Gothic ProN",sans-serif', w: 700, l: 500 },
  antique: { label: "アンティーク", d: '"Zen Antique","Hiragino Mincho ProN",serif', b: KAKU, w: 400, l: 400 },
  modern:  { label: "モダン",       d: '"Space Grotesk","Zen Kaku Gothic New",sans-serif', b: KAKU, w: 700, l: 500 },
};
export function applyTheme(color, font) {
  const r = document.documentElement.style, c = COLORS[color], f = FONTS[font];
  ["bg","surface","line","text","muted","accent","sub","ph1","ph2","g1"].forEach((k) => r.setProperty("--" + k, c[k]));
  r.setProperty("--serif", f.d); r.setProperty("--sans", f.b);
  r.setProperty("--dw", f.w); r.setProperty("--dl", f.l);
  r.setProperty("--tex", c.tex || "none");
  r.colorScheme = c.light ? "light" : "dark";
}
// 確認用のサンプルフライヤー(画像URLの代わり)
export const SAMPLE_FLYER = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 849"><rect width="600" height="849" fill="#1b2a38"/><circle cx="410" cy="290" r="200" fill="#9fb8c9" opacity=".25"/><circle cx="410" cy="290" r="115" fill="#e9e6df" opacity=".9"/><text x="48" y="640" font-family="serif" font-size="68" font-weight="700" fill="#e9e6df">Night Signals</text><text x="48" y="712" font-family="serif" font-size="50" fill="#e9e6df">Vol.3</text><text x="48" y="790" font-family="sans-serif" font-size="24" fill="#9fb8c9">2026.11.22 SAT / SAMPLE FLYER</text></svg>');


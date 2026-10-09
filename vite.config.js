import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// index.html の __SITE_URL__ を公開URLに置き換える(og:image / og:url 用)。
// 環境変数 VITE_PUBLIC_URL があればそれを使い、なければ現在の本番ドメインを使う。
// 管理画面のQRコード(src/lib/api.js)と api/og.js も同じ VITE_PUBLIC_URL を見るので、ドメインを変えるときはこの1か所だけ。
const siteUrl = (process.env.VITE_PUBLIC_URL || "https://live-event-red.vercel.app").replace(/\/$/, "");
const siteUrlPlugin = () => ({
  name: "site-url",
  transformIndexHtml: (html) => html.split("__SITE_URL__").join(siteUrl),
});

export default defineConfig({ plugins: [react(), siteUrlPlugin()] });

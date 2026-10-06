# ライブ告知ページ

## 内容を変える
- `src/data.js` : イベント情報・出演バンド・メールアドレス・色とフォント(`theme`)
- 画像は `public/` に入れて `"/flyer.jpg"` のように指定(バンド写真は `public/images/`)
- `public/ogp.jpg` : SNSに貼ったときのプレビュー画像(1200x630px)。仮画像なので差し替えてください

## Vercelで公開する
1. このフォルダをGitHubのリポジトリにアップロード
2. Vercelで「Add New → Project」からそのリポジトリを選び、そのまま Deploy(Viteは自動認識されます)
3. 公開URLが決まったら `index.html` の `YOUR-SITE.vercel.app` を実際のURLに書き換えて再デプロイ
4. 公開URLをFacebook・X・ホームページ・メールに貼る(Instagramはプロフィールのリンク欄かストーリーズ)

## バンド・リンク・地図
- バンドを増やす: `src/data.js` の `bands` に `{ ... }` を追加(`youtubeUrl` と `links` は省略可)
- 外部リンク: `links: [{ label: "Instagram", url: "https://..." }]` をいくつでも
- 会場の地図: 会場名と住所からGoogleマップを開きます。別の地図にしたい場合は `mapUrl` にURLを入れる

## 色・フォントを試す
公開URLの末尾に `?design` を付けると「デザイン」ボタンが出ます。決まったら `src/data.js` の `theme` に反映。

## YouTube
動画は「公開」または「限定公開」にし、「埋め込みを許可」をオンにしてください。非公開だと誰も見られません。

## ローカル確認(任意)
`npm install` → `npm run dev`

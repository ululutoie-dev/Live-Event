# ライブ告知ページ

## 管理画面(ブラウザから編集)のセットアップ
1. supabase.com で新しいプロジェクトを作る
2. SQL Editor に `supabase/schema.sql` を貼る。**先に `YOUR-ADMIN-EMAIL` を自分のメールに書き換え**てから Run
3. Authentication の Users から、そのメールでユーザーを追加(パスワードを設定し、メール確認済みにする)
4. Authentication の設定で、**新規サインアップ(Allow new users to sign up)をオフ**にする
5. Project Settings の API で、Project URL と `anon` `public` キーを控える(`service_role` キーは絶対に使わない)
6. Vercel のプロジェクトの Settings → Environment Variables に次の2つを追加し、再デプロイ
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
7. `公開URL/#/admin` を開いてログイン → 編集 → 「保存して公開」

メモ
- 公開ページの一番下の小さな「編集」リンクからも入れます
- SNSに貼ったときのプレビュー(OGP)は `index.html` の固定内容です。管理画面で変えても変わりません
- Supabaseの無料プロジェクトは、長期間アクセスがないと停止することがあります

## 複数イベントの使い方
- 管理画面(`公開URL/#/admin`)の最初の画面が「イベント管理」です。全イベントが開催日の新しい順に並びます
- 「＋ 新しいイベントを作成」で新規イベントを追加(既存のイベントには触れません)。新規は「非公開」で始まります
- イベント編集の「公開設定」で、イベントごとに公開/非公開を切り替え。非公開は管理画面にだけ残ります
- 公開ページ: 公開中が2件以上なら一覧(EVENTS)、1件ならそのイベントの詳細がトップに出ます
- 各イベントの個別URL: `公開URL/#/event/<イベントID>`(管理画面の一覧の「表示」から開けます)
- 出演者はイベントごとに独立しています。イベントを削除する機能はありません(非公開にして残す運用です)
- Supabase側のSQL変更は不要です(既存のテーブル構成のまま動きます)

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

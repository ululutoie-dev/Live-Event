/* ===== データ：ここを書き換えるだけで内容が変わります ===== */
export const event = {
  title: "Night Signals Vol.3",
  description: "三組の音が重なる、秋の夜",
  eventDate: "2026-11-22", // 管理画面の日付。表示用の「11.22」などは自動で作られます
  dateLabel: "11.22",
  weekday: "SAT 2026",
  date: "2026年11月22日(土)",
  open: "17:30",
  start: "18:00",
  venue: "SHELTER 下北沢(サンプル会場)",
  address: "東京都世田谷区(サンプル住所)",
  mapUrl: "", // 空なら「会場名+住所」でGoogleマップを開く。別の地図URLを使うときだけ入力
  ticket: "前売 ¥3,000 / 当日 ¥3,500(+1ドリンク別)",
  flyer: "", // 例: "/flyer.jpg" (public フォルダに置いた画像)。空ならタイトルが上に来ます
  theme: { color: "dusk", font: "mincho" }, // 下の COLORS / FONTS のキー
  notes: [
    "ドリンク代別途必要です。",
    "整理番号順の入場となります。",
    "撮影・録音はご遠慮ください。",
  ],
  email: "info@example.com", // 問い合わせ先メールアドレス(ボタンを押すとメール作成画面が開く)
};

// バンドを増やすには { ... } を1つ足すだけ。youtubeUrl と links は省略できます
export const bands = [
  {
    name: "Pale Harbor",
    description: "ギターの残響とゆるやかなグルーヴで聴かせる4人組。夜の街を歩くような曲が並ぶ。",
    image: "", // 例: "/images/pale-harbor.jpg" (public/images に置く)
    tone: 205,
    links: [
      { label: "Instagram", url: "https://example.com" },
      { label: "公式サイト", url: "https://example.com" },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    name: "夜更けのラジオ",
    description: "日本語詞とシンセが特徴の3ピース。ステージでは音数を絞り、声を前に出す。",
    image: "",
    tone: 250,
    links: [{ label: "Bandcamp", url: "https://example.com" }],
    youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    name: "Slow Collision",
    description: "轟音と静けさを行き来するインストバンド。ライブでの熱量が持ち味。",
    image: "",
    tone: 170,
    youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    name: "Tin Roof",
    description: "アコースティック編成のデュオ。YouTubeがなくても、リンクだけで紹介できます。",
    image: "",
    tone: 130,
    links: [{ label: "Spotify", url: "https://example.com" }],
  },
];


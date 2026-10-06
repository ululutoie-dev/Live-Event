import { useState } from "react";
import { COLORS, FONTS } from "../theme";

export default function ThemePicker({ color, setColor, font, setFont, flyerOn, setFlyerOn }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button className="pk-btn" onClick={() => setOpen(true)}>デザイン</button>;
  return (
    <div className="pk" role="dialog" aria-label="デザイン切り替え">
      <h4>カラー</h4>
      <div className="row">
        {Object.entries(COLORS).map(([k, c]) => (
          <button key={k} className="chip" aria-pressed={k === color} onClick={() => setColor(k)}>
            <i style={{ background: c.bg, boxShadow: `inset -7px 0 0 ${c.accent}` }} />{c.label}
          </button>
        ))}
      </div>
      <h4>フォント</h4>
      <div className="row">
        {Object.entries(FONTS).map(([k, f]) => (
          <button key={k} className="chip" aria-pressed={k === font} onClick={() => setFont(k)} style={{ fontFamily: f.d }}>{f.label}</button>
        ))}
      </div>
      <h4>フライヤー</h4>
      <div className="row">
        <button className="chip" aria-pressed={flyerOn} onClick={() => setFlyerOn(true)}>あり</button>
        <button className="chip" aria-pressed={!flyerOn} onClick={() => setFlyerOn(false)}>なし</button>
      </div>
      <button className="done" onClick={() => setOpen(false)}>閉じる</button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { fetchEvent, saveEvent } from "../../lib/api";
import { COLORS, FONTS } from "../../theme";
import { Field, ImageField } from "./fields";
import BandEditor from "./BandEditor";

const blankBand = () => ({ id: null, name: "", description: "", image: "", youtubeUrl: "", links: [], tone: 205 });

export default function Editor({ onLogout }) {
  const [ev, setEv] = useState(null);
  const [bands, setBands] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (note) => {
    try {
      const r = await fetchEvent();
      setEv(r.event); setBands(r.bands);
      setMsg(note || (r.source === "db" ? "" : "まだ保存されたデータがありません。サンプルを初期値に表示しています。保存すると公開されます。"));
    } catch (e) { setMsg("読み込みに失敗しました: " + e.message); }
  };
  useEffect(() => { load(); }, []);
  if (!ev) return <p>{msg || "読み込み中…"}</p>;

  const set = (k) => (e) => setEv({ ...ev, [k]: e.target.value });
  const setTheme = (k) => (e) => setEv({ ...ev, theme: { ...ev.theme, [k]: e.target.value } });
  const setBand = (i, b) => setBands(bands.map((x, j) => (j === i ? b : x)));
  const move = (i, d) => {
    const a = [...bands]; [a[i], a[i + d]] = [a[i + d], a[i]]; setBands(a);
  };
  const remove = (i) => { if (window.confirm("この出演者を削除しますか？(保存するまで確定しません)")) setBands(bands.filter((_, j) => j !== i)); };

  const save = async () => {
    if (!ev.title.trim() || !ev.eventDate) return setMsg("タイトルと日付は必須です。");
    if (bands.some((b) => !b.name.trim())) return setMsg("バンド名が空の出演者がいます。");
    setBusy(true); setMsg("保存中…");
    try { await saveEvent(ev, bands); await load("保存しました。公開ページに反映されています。"); }
    catch (e) { setMsg("保存に失敗しました: " + e.message); }
    setBusy(false);
  };

  return (
    <>
      <div className="adm-top">
        <a className="adm-link" href="#/">公開ページを見る</a>
        <button type="button" className="btn sm ghost" onClick={onLogout}>ログアウト</button>
      </div>
      <h1>イベントを編集</h1>

      <h2>イベント情報</h2>
      <Field label="イベントタイトル"><input className="in" value={ev.title} onChange={set("title")} /></Field>
      <Field label="イベント説明"><textarea className="in" value={ev.description} onChange={set("description")} /></Field>
      <Field label="日付"><input className="in" type="date" value={ev.eventDate || ""} onChange={set("eventDate")} /></Field>
      <div className="grid2">
        <Field label="開場"><input className="in" type="time" value={ev.open} onChange={set("open")} /></Field>
        <Field label="開演"><input className="in" type="time" value={ev.start} onChange={set("start")} /></Field>
      </div>
      <Field label="会場名"><input className="in" value={ev.venue} onChange={set("venue")} /></Field>
      <Field label="会場住所(地図リンクに使います)"><input className="in" value={ev.address} onChange={set("address")} /></Field>
      <Field label="地図URL(空なら会場名+住所でGoogleマップ)"><input className="in" type="url" inputMode="url" value={ev.mapUrl} onChange={set("mapUrl")} /></Field>
      <Field label="チケット料金"><input className="in" value={ev.ticket} onChange={set("ticket")} /></Field>
      <Field label="注意事項(1行に1つ)"><textarea className="in" value={ev.notes.join("\n")} onChange={(e) => setEv({ ...ev, notes: e.target.value.split("\n") })} /></Field>
      <Field label="問い合わせ先メールアドレス"><input className="in" type="email" value={ev.email} onChange={set("email")} /></Field>
      <ImageField label="メインビジュアル(フライヤー)" value={ev.flyer} onChange={(v) => setEv({ ...ev, flyer: v })} />
      <div className="grid2">
        <Field label="カラー">
          <select className="in" value={ev.theme.color} onChange={setTheme("color")}>
            {Object.entries(COLORS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="フォント">
          <select className="in" value={ev.theme.font} onChange={setTheme("font")}>
            {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
          </select>
        </Field>
      </div>

      <h2>出演者</h2>
      {bands.map((b, i) => (
        <BandEditor key={b.id || i} band={b} index={i} total={bands.length}
          onChange={(nb) => setBand(i, nb)} onMove={(d) => move(i, d)} onRemove={() => remove(i)} />
      ))}
      <button type="button" className="btn ghost" style={{ width: "100%" }} onClick={() => setBands([...bands, blankBand()])}>出演者を追加</button>

      <div className="savebar">
        <div className="inner">
          <p>{msg}</p>
          <button type="button" className="btn" onClick={save} disabled={busy}>保存して公開</button>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { fetchEventDetail, newEventDraft, saveEvent, slugError, publicBase } from "../../lib/api";
import { COLORS, FONTS } from "../../theme";
import { Field, ImageField } from "./fields";
import BandEditor from "./BandEditor";

const blankBand = () => ({ id: null, name: "", description: "", image: "", youtubeUrl: "", links: [], tone: 205 });

export default function Editor({ eventId, flash, onLogout, onSaved }) {
  const [ev, setEv] = useState(null);
  const [bands, setBands] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (note) => {
    try {
      if (!eventId) {
        const r = await newEventDraft();
        setEv(r.event); setBands(r.bands);
        setMsg(r.prefilled ? "まだ保存されたイベントがありません。サンプルを初期値に表示しています。" : "新しいイベントです。保存するまで追加されません(初期は非公開)。");
        return;
      }
      const r = await fetchEventDetail(eventId, { admin: true });
      if (!r) return setMsg("このイベントが見つかりません。");
      setEv(r.event); setBands(r.bands);
      setMsg(note || "");
    } catch (e) { setMsg("読み込みに失敗しました: " + e.message); }
  };
  useEffect(() => { load(flash); }, [eventId]);
  if (!ev) return (
    <>
      <p>{msg || "読み込み中…"}</p>
      <a className="adm-link" href="#/admin">← イベント一覧へ戻る</a>
    </>
  );

  const set = (k) => (e) => setEv({ ...ev, [k]: e.target.value });
  const setTheme = (k) => (e) => setEv({ ...ev, theme: { ...ev.theme, [k]: e.target.value } });
  const setBand = (i, b) => setBands(bands.map((x, j) => (j === i ? b : x)));
  const move = (i, d) => {
    const a = [...bands]; [a[i], a[i + d]] = [a[i + d], a[i]]; setBands(a);
  };
  const remove = (i) => { if (window.confirm("この出演者を削除しますか？(保存するまで確定しません)")) setBands(bands.filter((_, j) => j !== i)); };

  const save = async () => {
    if (!ev.title.trim() || !ev.eventDate) return setMsg("タイトルと日付は必須です。");
    const se = slugError((ev.slug || "").trim());
    if (se) return setMsg(se);
    if (ev.id && !(ev.slug || "").trim()) return setMsg("公開URL用IDを入力してください。");
    if (bands.some((b) => !b.name.trim())) return setMsg("バンド名が空の出演者がいます。");
    setBusy(true); setMsg("保存中…");
    try {
      const id = await saveEvent(ev, bands);
      if (!ev.id) { setBusy(false); return onSaved(id); }
      await load(ev.published ? "保存しました。公開ページに反映されています。" : "保存しました(非公開のため公開ページには表示されません)。");
    }
    catch (e) { setMsg("保存に失敗しました: " + e.message); }
    setBusy(false);
  };

  return (
    <>
      <div className="adm-top">
        <a className="btn sm ghost" href="#/admin">← イベント一覧へ戻る</a>
        <button type="button" className="btn sm ghost" onClick={onLogout}>ログアウト</button>
      </div>
      <h1>{ev.id ? "イベントを編集" : "新しいイベント"}</h1>
      <Field label="公開設定">
        <select className="in" value={ev.published ? "1" : "0"} onChange={(e) => setEv({ ...ev, published: e.target.value === "1" })}>
          <option value="1">公開(一般の人に表示)</option>
          <option value="0">非公開(管理画面にだけ残す)</option>
        </select>
      </Field>

      <h2>イベント情報</h2>
      <Field label="イベントタイトル"><input className="in" value={ev.title} onChange={set("title")} /></Field>
      <Field label="公開URL用ID(半角英小文字・数字・ハイフン)">
        <input className="in" value={ev.slug || ""} placeholder="例: vol8" autoCapitalize="none" autoCorrect="off" spellCheck="false"
          onChange={(e) => setEv({ ...ev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
        <small style={{ display: "block", marginTop: 6, color: "var(--muted)", wordBreak: "break-all" }}>
          告知ページ: {publicBase()}/#/e/{ev.slug || (ev.id ? "" : "(空欄なら自動で設定)")}
        </small>
      </Field>
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

      {ev.id && (
        <div style={{ marginTop: 32 }}>
          <a className="btn ghost" style={{ display: "block" }} href={`/e/${ev.slug || ev.id}`} target="_blank" rel="noopener noreferrer">告知ページを開く</a>
          <small style={{ display: "block", marginTop: 8, color: "var(--muted)" }}>
            {ev.published ? "保存済みの内容が表示されます。" : "非公開のため、公開するまでは表示されません。"}
          </small>
        </div>
      )}

      <div className="savebar">
        <div className="inner">
          <p>{msg}</p>
          <button type="button" className="btn" onClick={save} disabled={busy}>{ev.published ? "保存して公開" : "保存(非公開)"}</button>
        </div>
      </div>
    </>
  );
}

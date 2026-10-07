import { useEffect, useState } from "react";
import { fetchAdminEvents, eventUrl } from "../../lib/api";
import QrModal from "./QrModal";

export default function AdminEventList({ onLogout }) {
  const [events, setEvents] = useState(null);
  const [err, setErr] = useState("");
  const [qr, setQr] = useState(null);
  useEffect(() => {
    fetchAdminEvents().then(setEvents).catch((e) => setErr("読み込みに失敗しました: " + e.message));
  }, []);
  return (
    <>
      <div className="adm-top" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="btn sm ghost" onClick={onLogout}>ログアウト</button>
      </div>
      <h1>イベント管理</h1>
      <a className="btn" style={{ display: "block", margin: "20px 0 8px" }} href="#/admin/new">＋ 新しいイベントを作成</a>
      {err && <p className="err">{err}</p>}
      {!events && !err && <p style={{ color: "var(--muted)" }}>読み込み中…</p>}
      {events?.length === 0 && <p style={{ color: "var(--muted)" }}>まだイベントがありません。</p>}
      {events?.map((e) => (
        <div className="ev-row" key={e.id}>
          <div className="ev-row-main">
            <small>{(e.eventDate || "").replace(/-/g, "/")}</small>
            <b>{e.title}</b>
            <span className={"badge" + (e.published ? " on" : "")}>{e.published ? "公開中" : "非公開"}</span>
          </div>
          <div className="ev-row-act">
            <a className="btn sm" href={`#/admin/edit/${e.id}`}>編集</a>
            <div className="ev-row-links">
              {e.published && <a className="adm-link" href={`#/e/${e.slug || e.id}`}>告知ページ</a>}
              <button type="button" className="adm-link linkbtn" onClick={() => setQr(e)}>QRコード</button>
            </div>
          </div>
        </div>
      ))}
      {qr && <QrModal event={qr} url={eventUrl(qr)} onClose={() => setQr(null)} />}
    </>
  );
}

import { useEffect, useState } from "react";
import { fetchAdminEvents } from "../../lib/api";

export default function AdminEventList({ onLogout }) {
  const [events, setEvents] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetchAdminEvents().then(setEvents).catch((e) => setErr("読み込みに失敗しました: " + e.message));
  }, []);
  return (
    <>
      <div className="adm-top">
        <a className="adm-link" href="#/">公開ページを見る</a>
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
            {e.published && <a className="adm-link" href={`#/event/${e.id}`}>表示</a>}
          </div>
        </div>
      ))}
    </>
  );
}

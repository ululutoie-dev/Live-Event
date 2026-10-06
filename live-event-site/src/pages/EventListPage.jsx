import { useEffect } from "react";
import { applyTheme } from "../theme";

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Item({ e }) {
  return (
    <a className="ev-item" href={`#/event/${e.id}`}>
      <span className="ev-date">{e.dateLabel}<small>{(e.eventDate || "").slice(0, 4)}</small></span>
      <span className="ev-body">
        <b className="ev-title">{e.title}</b>
        <span className="ev-meta">{e.venue}</span>
      </span>
    </a>
  );
}

// 公開中イベントの一覧。これから開催 → 開催日の近い順、過去は下にまとめて新しい順
export default function EventListPage({ events }) {
  const today = ymd(new Date());
  const upcoming = events.filter((e) => e.eventDate >= today).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = events.filter((e) => e.eventDate < today).sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  const lead = upcoming[0] || past[0];
  useEffect(() => applyTheme(lead.theme.color, lead.theme.font), [lead]);
  useEffect(() => { document.title = "EVENTS"; }, []);
  return (
    <main className="page">
      <section className="hero plain">
        <div className="pad" style={{ paddingBottom: 56 }}>
          <h1 className="section-title" style={{ marginBottom: 20 }}>EVENTS</h1>
          {upcoming.map((e) => <Item key={e.id} e={e} />)}
          {upcoming.length === 0 && <p className="ev-meta">これから開催されるイベントはありません。</p>}
        </div>
      </section>
      {past.length > 0 && (
        <section className="pad" style={{ paddingBottom: 56 }}>
          <h2 className="section-title past">PAST</h2>
          {past.map((e) => <Item key={e.id} e={e} />)}
        </section>
      )}
      <div className="footer"><a className="edit-link" href="#/admin">編集</a></div>
    </main>
  );
}

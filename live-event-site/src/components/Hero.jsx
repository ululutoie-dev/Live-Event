import { useState } from "react";

export default function Hero({ event, flyer }) {
  const [zoom, setZoom] = useState(false);
  return (
    <header className={"hero" + (flyer ? "" : " plain")}>
      {flyer && (
        <button className="flyer" onClick={() => setZoom(true)} aria-label="フライヤーを拡大">
          <img src={flyer} alt={`${event.title} フライヤー`} />
          <span>タップで拡大</span>
        </button>
      )}
      <div className="hero-text pad">
        <div className="hero-date">{event.dateLabel}<small>{event.weekday}</small></div>
        <h1 className="hero-title">{event.title}</h1>
        <p className="hero-meta">
          <span>{event.subtitle}</span>
          <span>{event.venue}</span>
          <span>OPEN {event.open} / START {event.start}</span>
        </p>
      </div>
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <span className="x">閉じる</span>
          <img src={flyer} alt={`${event.title} フライヤー`} />
        </div>
      )}
    </header>
  );
}

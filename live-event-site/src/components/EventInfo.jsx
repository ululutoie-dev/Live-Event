export default function EventInfo({ event }) {
  const mapUrl = event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;
  const rows = [
    ["日付", event.date],
    ["開場", event.open],
    ["開演", event.start],
    ["会場", <>{event.venue}<br />{event.address}<br /><a className="maplink" href={mapUrl} target="_blank" rel="noopener noreferrer">地図を開く</a></>],
    ["料金", event.ticket],
  ];
  return (
    <section className="section pad">
      <h2 className="section-title">EVENT INFO</h2>
      <dl className="info">
        {rows.map(([k, v]) => (
          <div className="info-row" key={k}>
            <dt>{k}</dt>
            <dd style={{ whiteSpace: "pre-line" }}>{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="notes">{event.notes.map((n) => <li key={n}>{n}</li>)}</ul>
    </section>
  );
}

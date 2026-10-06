import { Field, ImageField } from "./fields";

export default function BandEditor({ band, index, total, onChange, onMove, onRemove }) {
  const up = (p) => onChange({ ...band, ...p });
  const setLink = (i, p) => up({ links: band.links.map((l, j) => (j === i ? { ...l, ...p } : l)) });
  return (
    <section className="acard">
      <div className="acard-head">
        <b>{index + 1}. {band.name || "新しい出演者"}</b>
        <span>
          <button type="button" className="btn sm ghost" disabled={index === 0} onClick={() => onMove(-1)}>上へ</button>
          <button type="button" className="btn sm ghost" disabled={index === total - 1} onClick={() => onMove(1)}>下へ</button>
          <button type="button" className="btn sm ghost" onClick={onRemove}>削除</button>
        </span>
      </div>
      <Field label="バンド名"><input className="in" value={band.name} onChange={(e) => up({ name: e.target.value })} /></Field>
      <Field label="紹介文"><textarea className="in" value={band.description} onChange={(e) => up({ description: e.target.value })} /></Field>
      <ImageField label="ライブ写真" value={band.image} onChange={(v) => up({ image: v })} />
      <Field label="YouTube URL"><input className="in" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=..." value={band.youtubeUrl} onChange={(e) => up({ youtubeUrl: e.target.value })} /></Field>
      <div className="fld">
        <span>外部リンク(Instagramなど)</span>
        {band.links.map((l, i) => (
          <div className="link-row" key={i}>
            <input className="in" placeholder="表示名" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} />
            <input className="in" type="url" inputMode="url" placeholder="https://..." value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} />
            <button type="button" className="btn sm ghost" onClick={() => up({ links: band.links.filter((_, j) => j !== i) })}>削除</button>
          </div>
        ))}
        <button type="button" className="btn sm ghost" onClick={() => up({ links: [...band.links, { label: "", url: "" }] })}>リンクを追加</button>
      </div>
    </section>
  );
}

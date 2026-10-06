import { toneBg } from "../utils";
import YouTubeEmbed from "./YouTubeEmbed";

export default function BandCard({ band }) {
  const photoStyle = band.image
    ? { backgroundImage: `url(${band.image})` }
    : { backgroundImage: toneBg(band.tone) };
  return (
    <article className="band">
      <div className="band-photo" style={photoStyle} role="img" aria-label={`${band.name}のライブ写真`} />
      <h3 className="band-name">{band.name}</h3>
      <p className="band-desc">{band.description}</p>
      {band.youtubeUrl && <YouTubeEmbed url={band.youtubeUrl} title={band.name} />}
      {band.links?.length > 0 && (
        <div className="links">
          {band.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
          ))}
        </div>
      )}
    </article>
  );
}

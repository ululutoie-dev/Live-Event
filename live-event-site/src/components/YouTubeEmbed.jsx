import { useState } from "react";
import { getYouTubeId } from "../utils";

export default function YouTubeEmbed({ url, title }) {
  const [playing, setPlaying] = useState(false);
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={`${title} ライブ映像`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <>
          <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => (e.target.style.display = "none")} />
          <button onClick={() => setPlaying(true)} aria-label={`${title}のライブ映像を再生`}>
            <span className="play">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
            </span>
            <span className="label">ライブ映像を見る</span>
          </button>
        </>
      )}
    </div>
  );
}

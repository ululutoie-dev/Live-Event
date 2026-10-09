/* ===== ユーティリティ ===== */
export function getYouTubeId(url) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
export const toneBg = (angle) => `linear-gradient(${angle}deg, var(--ph1), var(--ph2))`;


import { useEffect, useState } from "react";
import { fetchPublishedEvents } from "../lib/api";
import EventPage from "./EventPage";
import EventListPage from "./EventListPage";

// 公開側のルーティング
//   #/event/<id または slug> : そのイベントの詳細ページ
//   #/ (トップ)              : 公開中が2件以上なら一覧、1件ならそのイベントの詳細(今までのURLのまま見られます)
export default function PublicPage({ hash }) {
  const [list, setList] = useState(null);
  useEffect(() => { fetchPublishedEvents().then(setList).catch(() => setList("error")); }, []);

  const m = hash.match(/^#\/event\/([^/?]+)/);
  if (m) {
    return <EventPage key={m[1]} idOrSlug={decodeURIComponent(m[1])} multiple={Array.isArray(list) && list.length > 1} />;
  }
  if (list === null) return <p className="loading"></p>;
  if (list === "error") return <p className="loading">読み込めませんでした。時間をおいて開き直してください。</p>;
  if (list.length === 0) return <p className="loading">現在公開中のイベントはありません。</p>;
  if (list.length === 1) return <EventPage key={list[0].id} idOrSlug={list[0].id} multiple={false} />;
  return <EventListPage events={list} />;
}

import { useEffect, useState } from "react";
import PublicPage from "./pages/PublicPage";
import AdminPage from "./components/admin/AdminPage";

// 以前の「#/e/xxx」「#/event/xxx」のURLを開いたら、同じイベントの「/e/xxx」に切り替える
// (アドレスバーからコピーしたURLが、LINEなどでイベントごとのプレビューになるようにするため)
const legacy = window.location.hash.match(/^#\/(?:e|event)\/([^/?]+)/);
if (legacy) window.history.replaceState(null, "", `/e/${legacy[1]}${window.location.search}`);

// 公開: "/" (一覧) と "/e/<slug または UUID>" (詳細)、管理: "/#/admin"
const publicRoute = () => {
  const m = window.location.pathname.match(/^\/e\/([^/]+)/);
  return m ? `#/e/${m[1]}` : window.location.hash;
};

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const f = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return hash.startsWith("#/admin") ? <AdminPage hash={hash} /> : <PublicPage hash={publicRoute()} />;
}

import { useEffect, useState } from "react";
import PublicPage from "./pages/PublicPage";
import AdminPage from "./components/admin/AdminPage";

// 公開: "/#/" (一覧) と "/#/event/<id>" (詳細)、管理: "/#/admin" (Vercelの追加設定が不要)
export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const f = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return hash.startsWith("#/admin") ? <AdminPage hash={hash} /> : <PublicPage hash={hash} />;
}

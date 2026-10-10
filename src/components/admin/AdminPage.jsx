import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { applyTheme } from "../../theme";
import Login from "./Login";
import Editor from "./Editor";
import AdminEventList from "./AdminEventList";

//   #/admin            : イベント一覧
//   #/admin/new        : 新規イベント
//   #/admin/edit/<id>  : そのイベントの編集
export default function AdminPage({ hash }) {
  const [session, setSession] = useState(undefined);
  const [flash, setFlash] = useState("");
  useEffect(() => applyTheme("dusk", "gothic"), []);
  useEffect(() => {
    if (!supabase) return setSession(null);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="adm">
        <p>Supabaseが未設定です。READMEの手順で環境変数を設定してください。</p>
        <a className="adm-link" href="#/">公開ページへ戻る</a>
      </div>
    );
  }
  if (session === undefined) return null;
  if (!session) return <div className="adm"><Login /></div>;

  const logout = () => supabase.auth.signOut();
  const edit = hash.match(/^#\/admin\/edit\/([^/?]+)/);
  const isNew = hash.startsWith("#/admin/new");
  const onSaved = (id) => { setFlash("イベントを作成しました。"); window.location.hash = `#/admin/edit/${id}`; };
  return (
    <div className="adm">
      {edit ? <Editor key={edit[1]} eventId={edit[1]} flash={flash} onLogout={logout} onSaved={onSaved} />
        : isNew ? <Editor key="new" eventId={null} onLogout={logout} onSaved={onSaved} />
        : <AdminEventList onLogout={logout} />}
    </div>
  );
}

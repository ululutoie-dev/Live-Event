import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { applyTheme } from "../../theme";
import Login from "./Login";
import Editor from "./Editor";

export default function AdminPage() {
  const [session, setSession] = useState(undefined);
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
  return <div className="adm">{session ? <Editor onLogout={() => supabase.auth.signOut()} /> : <Login />}</div>;
}

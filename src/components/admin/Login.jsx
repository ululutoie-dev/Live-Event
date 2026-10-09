import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr("ログインできませんでした。メールアドレスとパスワードを確認してください。");
    setBusy(false);
  };
  return (
    <form onSubmit={submit}>
      <h1>管理者ログイン</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 28px" }}>イベント情報の編集は管理者のみ可能です。</p>
      <label className="fld"><span>メールアドレス</span>
        <input className="in" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="fld"><span>パスワード</span>
        <input className="in" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      </label>
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ width: "100%" }} disabled={busy}>{busy ? "確認中…" : "ログイン"}</button>
      <p style={{ marginTop: 24 }}><a className="adm-link" href="#/">公開ページへ戻る</a></p>
    </form>
  );
}

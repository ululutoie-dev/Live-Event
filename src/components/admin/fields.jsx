import { useState } from "react";
import { uploadImage } from "../../lib/api";

export function Field({ label, children }) {
  return <label className="fld"><span>{label}</span>{children}</label>;
}

// 「写真を選ぶ」(アップロード) か 画像URL貼り付けのどちらでも
export function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    try { onChange(await uploadImage(file)); }
    catch (x) { setErr("アップロードに失敗しました: " + x.message); }
    setBusy(false);
    e.target.value = "";
  };
  return (
    <div className="fld">
      <span>{label}</span>
      {value && <img className="thumb" src={value} alt="" />}
      <div className="img-row">
        <label className="btn sm">{busy ? "アップロード中…" : "写真を選ぶ"}
          <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
        </label>
        {value && <button type="button" className="btn sm ghost" onClick={() => onChange("")}>外す</button>}
      </div>
      <input className="in" type="url" inputMode="url" placeholder="または画像URLを貼る" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      {err && <small className="err">{err}</small>}
    </div>
  );
}

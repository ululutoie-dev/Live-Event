import { useEffect, useState } from "react";
import QRCode from "qrcode";

// イベントの告知ページURLのQRコードを大きく表示し、PNGとして保存できる
export default function QrModal({ event, url, onClose }) {
  const [png, setPng] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } })
      .then(setPng).catch(() => setPng(""));
  }, [url]);
  return (
    <div className="qr-back" role="dialog" aria-modal="true" aria-label="QRコード" onClick={onClose}>
      <div className="qr-card" onClick={(e) => e.stopPropagation()}>
        <b className="qr-title">{event.title}</b>
        {png ? <img className="qr-img" src={png} alt={`${event.title} のQRコード`} /> : <div className="qr-img" />}
        <p className="qr-url">{url}</p>
        {!event.published && <p className="err">このイベントは非公開です。公開するとQRコードから開けます。</p>}
        <div className="qr-act">
          {png && <a className="btn" href={png} download={`qr-${event.slug || "event"}.png`}>PNG画像を保存</a>}
          <button type="button" className="btn ghost" onClick={onClose}>閉じる</button>
        </div>
        <small className="qr-hint">保存できないときは、QRコードを長押しして画像を保存してください。</small>
      </div>
    </div>
  );
}

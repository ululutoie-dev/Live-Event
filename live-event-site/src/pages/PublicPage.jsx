import { useEffect, useState } from "react";
import { fetchEvent } from "../lib/api";
import { applyTheme, SAMPLE_FLYER } from "../theme";
import Hero from "../components/Hero";
import Lineup from "../components/Lineup";
import EventInfo from "../components/EventInfo";
import ContactButton from "../components/ContactButton";
import ThemePicker from "../components/ThemePicker";

// URLの末尾に ?design を付けると、色・フォントを試せるボタンが出ます(一般公開時は出ません)
const showPicker = new URLSearchParams(window.location.search).has("design");

export default function PublicPage() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [color, setColor] = useState(null);
  const [font, setFont] = useState(null);
  const [flyerOn, setFlyerOn] = useState(null);

  useEffect(() => { fetchEvent().then(setData).catch(() => setFailed(true)); }, []);
  const ev = data?.event;
  const c = color || ev?.theme.color || "dusk";
  const f = font || ev?.theme.font || "mincho";
  useEffect(() => applyTheme(c, f), [c, f]);
  useEffect(() => { if (ev) document.title = ev.title; }, [ev]);

  if (!ev) return <p className="loading">{failed ? "読み込めませんでした。時間をおいて開き直してください。" : ""}</p>;
  const on = flyerOn ?? Boolean(ev.flyer);
  const flyer = showPicker ? (on ? ev.flyer || SAMPLE_FLYER : "") : ev.flyer;
  return (
    <main className="page">
      <Hero event={ev} flyer={flyer} />
      <Lineup bands={data.bands} />
      <EventInfo event={ev} />
      <ContactButton title={ev.title} email={ev.email} />
      <div className="footer">
        {ev.title}
        <a className="edit-link" href="#/admin">編集</a>
      </div>
      {showPicker && <ThemePicker {...{ color: c, setColor, font: f, setFont, flyerOn: on, setFlyerOn }} />}
    </main>
  );
}

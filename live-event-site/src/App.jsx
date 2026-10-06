import { useEffect, useState } from "react";
import { event, bands } from "./data";
import { applyTheme, SAMPLE_FLYER } from "./theme";
import Hero from "./components/Hero";
import Lineup from "./components/Lineup";
import EventInfo from "./components/EventInfo";
import ContactButton from "./components/ContactButton";
import ThemePicker from "./components/ThemePicker";

// URLの末尾に ?design を付けると、色・フォントを試せるボタンが出ます(一般公開時は出ません)
const showPicker = new URLSearchParams(window.location.search).has("design");

export default function App() {
  const [color, setColor] = useState(event.theme.color);
  const [font, setFont] = useState(event.theme.font);
  const [flyerOn, setFlyerOn] = useState(Boolean(event.flyer));
  useEffect(() => applyTheme(color, font), [color, font]);
  const flyer = showPicker ? (flyerOn ? event.flyer || SAMPLE_FLYER : "") : event.flyer;
  return (
    <main className="page">
      <Hero event={event} flyer={flyer} />
      <Lineup bands={bands} />
      <EventInfo event={event} />
      <ContactButton title={event.title} email={event.email} />
      <div className="footer">{event.title}</div>
      {showPicker && <ThemePicker {...{ color, setColor, font, setFont, flyerOn, setFlyerOn }} />}
    </main>
  );
}

import BandCard from "./BandCard";

export default function Lineup({ bands }) {
  return (
    <section className="section pad">
      <h2 className="section-title">LINE UP</h2>
      {bands.map((b) => <BandCard key={b.name} band={b} />)}
    </section>
  );
}

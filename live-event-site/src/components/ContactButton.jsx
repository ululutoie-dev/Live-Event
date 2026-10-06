export default function ContactButton({ title, email }) {
  const href = `mailto:${email}?subject=${encodeURIComponent(title + " 予約・問い合わせ")}`;
  return (
    <section className="cta-wrap pad">
      <a className="cta" href={href}>予約・問い合わせ</a>
    </section>
  );
}

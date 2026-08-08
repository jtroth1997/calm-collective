const Leaf = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 46" aria-hidden="true">
    <path d="M40 42C29 30 26 16 40 3c14 13 11 27 0 39Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M38 42C25 43 14 36 10 23c15-2 25 6 28 19ZM42 42c13 1 24-6 28-19-15-2-25 6-28 19Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4L19 7.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Calm Collective home">
          <span>calm</span><small>collective</small>
        </a>
        <nav aria-label="Main navigation">
          <a href="#rooms">The space</a>
          <a href="#pricing">Pricing</a>
          <a href="#location">Location</a>
        </nav>
        <a className="header-cta" href="tel:07508070295">Arrange a viewing</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Therapy rooms · Warwick</p>
          <h1>A calm space<br />for <em>your</em> practice.</h1>
          <p className="hero-intro">Beautiful, private therapy rooms for independent therapists, wellbeing practitioners and coaches — thoughtfully designed so you can focus on the people you support.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="tel:07508070295">Arrange a viewing <span>↗</span></a>
            <a className="text-link" href="#rooms">Explore the space <span>↓</span></a>
          </div>
          <div className="hero-meta">
            <span><b>7 days</b> a week</span>
            <span><b>8am–9pm</b> availability</span>
            <span><b>From £15</b> per hour</span>
          </div>
        </div>
        <div className="hero-image">
          <img src="/therapy-room.png" alt="A calm therapy room at Calm Collective in Warwick" />
          <div className="hero-badge"><Leaf /><span>A space to feel<br />at ease</span></div>
        </div>
      </section>

      <section className="intro section-pad">
        <p className="eyebrow">A space for independent therapists</p>
        <div className="intro-grid">
          <h2>Room to do your<br /><em>best work.</em></h2>
          <div>
            <p className="lead">Calm Collective gives you the freedom to run your own practice from a professional, welcoming base in the heart of Warwick.</p>
            <p>Three adaptable therapy rooms, a comfortable shared waiting area and the practical things you need — without the commitment of taking on a space of your own.</p>
          </div>
        </div>
      </section>

      <section className="qualities" aria-label="What Calm Collective offers">
        {['Warm & inviting','Private & quiet','Professional','Flexible','Comfortable','Convenient'].map((item, i) => (
          <div key={item}><span>0{i + 1}</span><p>{item}</p></div>
        ))}
      </section>

      <section className="space section-pad" id="rooms">
        <div className="section-heading">
          <div><p className="eyebrow">The space</p><h2>Designed for calm.<br /><em>Made to adapt.</em></h2></div>
          <p>Neutral, peaceful rooms designed to feel considered but never clinical. Make the space your own for each session, then leave the rest to us.</p>
        </div>
        <div className="gallery">
          <figure className="gallery-main"><img src="/therapy-room.png" alt="Therapy room with treatment couch and comfortable chairs" /><figcaption><span>01</span> One of three multi-purpose rooms</figcaption></figure>
          <div className="gallery-side">
            <figure><img src="/calm-collective-window.png" alt="Calm Collective sage green window branding" /></figure>
            <div className="amenities">
              <p className="eyebrow">Included</p>
              <ul>
                <li><Tick /> Comfortable waiting area</li>
                <li><Tick /> Wi-Fi</li>
                <li><Tick /> Kitchenette & bathroom</li>
                <li><Tick /> Central Warwick location</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="suitable section-pad">
        <div className="suitable-copy">
          <p className="eyebrow">A place for your practice</p>
          <h2>Space that works<br />the way <em>you do.</em></h2>
          <p>Created for talking and wellbeing professionals looking to start, grow or simply give their practice a beautiful home.</p>
        </div>
        <div className="practice-list">
          {['Talking based therapy','Counselling & consulting','Coaching & mentoring','Behavioural therapy','Psychology & psychotherapy','Wellbeing therapy','Nutrition & lifestyle','Quiet holistic therapies'].map((item, i) => <div key={item}><span>{String(i+1).padStart(2,'0')}</span>{item}</div>)}
          <p className="note">Quiet holistic therapies such as reiki, aromatherapy, massage and acupuncture may also be suitable. We&apos;re happy to discuss your requirements.</p>
        </div>
      </section>

      <section className="pricing section-pad" id="pricing">
        <div className="pricing-intro">
          <p className="eyebrow light">Simple, flexible pricing</p>
          <h2>Your practice.<br /><em>Your rhythm.</em></h2>
          <p>Book around the way you work, whether that&apos;s the occasional session, the same weekly slot, or a room to call your own.</p>
        </div>
        <div className="price-card">
          <div className="price-top"><p>Pay as you go</p><div><strong>£15</strong><span>/ hour</span></div><small>First come, first served</small></div>
          <div className="price-options">
            <div><h3>Regular weekly</h3><p>Reserve regular pre-booked times that work for your practice.</p></div>
            <div><h3>Exclusive use</h3><p>Full-time exclusive use of your own room is also available.</p></div>
          </div>
          <div className="price-foot"><p><b>£25 one-off membership</b><br />Non-refundable · includes a set of keys</p><p>Discounted rates available for bookings over 3 hours.</p></div>
        </div>
      </section>

      <section className="details section-pad">
        <div className="detail"><span>01</span><div><h3>Come and have a look</h3><p>Before joining, we&apos;ll show you around the centre and answer any questions so you can see if the space feels right for you.</p></div></div>
        <div className="detail"><span>02</span><div><h3>Simple monthly payment</h3><p>Use the space as agreed and pay by bank transfer at the end of the month. A 48-hour cancellation policy applies.</p></div></div>
        <div className="detail"><span>03</span><div><h3>Professional standards</h3><p>Therapists sign our code of conduct and provide professional certification and proof of their own public liability insurance.</p></div></div>
      </section>

      <section className="founder section-pad">
        <p className="eyebrow">Created by someone who understands</p>
        <div className="founder-grid">
          <h2>From one practitioner<br />to <em>another.</em></h2>
          <div>
            <p>Calm Collective was created by Angel Gold, a qualified and experienced clinical hypnotherapist who has supported clients in Warwickshire for over 15 years.</p>
            <p>It means the details that matter to practitioners — privacy, calm, comfort and professionalism — have been considered from the start.</p>
            <div className="founder-links"><a className="text-link" href="https://www.angelgoldhypnotherapy.co.uk/" target="_blank" rel="noreferrer">Angel Gold Hypnotherapy <span>↗</span></a><a className="text-link" href="https://www.linkedin.com/in/angel-gold-958a2a50/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a></div>
          </div>
        </div>
      </section>

      <section className="location" id="location">
        <div className="location-photo"><img src="/calm-collective-warwick.png" alt="The Calm Collective premises in central Warwick" /></div>
        <div className="location-copy">
          <p className="eyebrow">Central Warwick</p>
          <h2>Beautifully placed.<br /><em>Easy to reach.</em></h2>
          <p>Located in the centre of Warwick, our rooms are well connected for clients and practitioners across Leamington Spa, Kenilworth, Stratford-upon-Avon, Coventry, Rugby and wider Warwickshire.</p>
          <p className="parking">Local parking options are available close by.</p>
          <a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Warwick%2C+Warwickshire" target="_blank" rel="noreferrer">Explore Warwick on Google Maps <span>↗</span></a>
        </div>
      </section>

      <section className="cta section-pad">
        <Leaf className="cta-leaf" />
        <p className="eyebrow">Come and see for yourself</p>
        <h2>Could this be the<br />home for <em>your practice?</em></h2>
        <p>We&apos;d love to show you around Calm Collective and talk through what you need.</p>
        <a className="button button-light" href="tel:07508070295">Call 07508 070295 <span>↗</span></a>
      </section>

      <footer>
        <div className="footer-brand"><span>calm</span><small>collective</small></div>
        <p>Therapy rooms to rent in Warwick, Warwickshire.</p>
        <a href="tel:07508070295">07508 070295</a>
        <p className="copyright">© 2026 Calm Collective</p>
      </footer>
    </main>
  );
}

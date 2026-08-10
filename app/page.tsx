"use client";

import { useMemo, useState } from "react";

const Leaf = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 46" aria-hidden="true">
    <path d="M40 42C29 30 26 16 40 3c14 13 11 27 0 39Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M38 42C25 43 14 36 10 23c15-2 25 6 28 19ZM42 42c13 1 24-6 28-19-15-2-25 6-28 19Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4L19 7.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const appointmentTimes = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

function AppointmentBooking() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [detailsReady, setDetailsReady] = useState(false);
  const earliestDate = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);

  return (
    <section className="booking section-pad" id="appointment">
      <div className="booking-intro">
        <p className="eyebrow">Make an appointment</p>
        <h2>Let&apos;s talk about<br /><em>your practice.</em></h2>
        <p>Book a relaxed, no-obligation visit to see the rooms, meet Angel and talk through exactly what you need from your working space.</p>
        <div className="booking-note"><Leaf /><span>Appointments are available from 10am to 4pm, with the final session beginning at 3pm.</span></div>
      </div>
      <form className="booking-card" onSubmit={(event) => event.preventDefault()}>
        <div className="booking-step"><span>01</span><div><label htmlFor="appointment-date">Choose a date</label><input id="appointment-date" type="date" min={earliestDate} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} /></div></div>
        <div className={`booking-step ${date ? "" : "is-muted"}`}><span>02</span><div><p className="field-label">Choose a time</p><div className="time-grid" aria-label="Available appointment times">{appointmentTimes.map((slot) => <button type="button" key={slot} disabled={!date} className={time === slot ? "selected" : ""} onClick={() => setTime(slot)}>{slot}</button>)}</div></div></div>
        <div className={`booking-step details-step ${date && time ? "" : "is-muted"}`}><span>03</span><div><p className="field-label">Tell us about you</p><div className="contact-grid"><label><span>Name</span><input type="text" name="name" autoComplete="name" required disabled={!date || !time} onChange={(event) => setDetailsReady(event.currentTarget.form?.checkValidity() ?? false)} /></label><label><span>Email</span><input type="email" name="email" autoComplete="email" required disabled={!date || !time} onChange={(event) => setDetailsReady(event.currentTarget.form?.checkValidity() ?? false)} /></label><label><span>Phone number</span><input type="tel" name="phone" autoComplete="tel" required disabled={!date || !time} onChange={(event) => setDetailsReady(event.currentTarget.form?.checkValidity() ?? false)} /></label><label className="requirements"><span>What would you like to discuss?</span><textarea name="requirements" rows={4} required disabled={!date || !time} placeholder="Tell us about your practice, the room you need and the days you are considering…" onChange={(event) => setDetailsReady(event.currentTarget.form?.checkValidity() ?? false)} /></label></div></div></div>
        <div className={`booking-step final-step ${date && time && detailsReady ? "" : "is-muted"}`}><span>04</span><div><p className="field-label">Request your appointment</p><p>{date && time ? `${new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at ${time}` : "Choose a date and time to continue."}</p><button className="request-button" type="submit" disabled>Online requests are being connected</button><small className="connection-note">Need to speak sooner? Call <a href="tel:07508070295">07508 070295</a>.</small></div></div>
      </form>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <section className="premium-splash" id="top" aria-label="Calm Collective introduction">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="wind-field wind-field-one" />
        <div className="wind-field wind-field-two" />
        <div className="splash-lockup">
          <Leaf className="splash-mark" />
          <div className="splash-wordmark"><span>calm</span><small>collective</small></div>
          <p>Therapy rooms · Warwick</p>
          <div className="splash-purpose">A calm, professional home for independent therapists.</div>
          <a className="splash-cta" href="#appointment">Book a room viewing <span>↓</span></a>
        </div>
        <a className="scroll-cue" href="#welcome"><span>Discover</span><i /></a>
      </section>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Calm Collective home">
          <span>calm</span><small>collective</small>
        </a>
        <nav aria-label="Main navigation">
          <a href="#rooms">The space</a>
          <a href="#appointment">Appointments</a>
          <a href="#location">Location</a>
        </nav>
        <a className="header-cta" href="#appointment">Make an appointment</a>
      </header>

      <section className="hero" id="welcome">
        <div className="hero-copy">
          <p className="eyebrow">Therapy rooms · Warwick</p>
          <h1>Space for the work<br />that <em>matters.</em></h1>
          <p className="hero-intro">Looking for a professional home for your practice? Discover beautiful, private therapy rooms designed for independent therapists, wellbeing practitioners and coaches.</p>
          <div className="hero-actions">
            <a className="button button-light" href="#appointment">Book a room viewing <span>↓</span></a>
            <a className="text-link" href="#rooms">Explore the space <span>↓</span></a>
          </div>
          <div className="hero-meta">
            <span><b>7 days</b> a week</span>
            <span><b>8am–9pm</b> availability</span>
            <span><b>Private</b> &amp; peaceful</span>
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

      <AppointmentBooking />

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
        <a className="button button-light" href="#appointment">Make an appointment <span>↓</span></a>
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

import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="page landing">
      <div className="container landing-hero">
        <section className="landing-intro">
          <h2 className="landing-title">Your trusted healthcare appointment platform</h2>
          <p className="landing-subtitle">
            Connect with certified doctors, book appointments instantly, and manage your healthcare journey — all in one secure platform.
          </p>
          <p className="landing-description">
            MedLink simplifies medical appointments for patients and doctors alike. Search by specialty, view real-time availability, 
            and get instant confirmations. Doctors manage their schedules and patient interactions seamlessly.
          </p>
        </section>

        <section className="landing-benefits">
          <h3>Why choose MedLink?</h3>
          <div className="benefits-grid">
            <article className="benefit-item">
              <div className="benefit-icon">✅</div>
              <h4>Easy Booking</h4>
              <p>Find and book appointments in seconds with our intuitive platform.</p>
            </article>

            <article className="benefit-item">
              <div className="benefit-icon">🔒</div>
              <h4>Secure & Private</h4>
              <p>Your health data is encrypted and protected with industry-leading security.</p>
            </article>

            <article className="benefit-item">
              <div className="benefit-icon">⏰</div>
              <h4>Save Time</h4>
              <p>No more phone calls or waiting — manage everything online 24/7.</p>
            </article>

            <article className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h4>Smart Matching</h4>
              <p>Find the right doctor based on specialty, location, and availability.</p>
            </article>

            <article className="benefit-item">
              <div className="benefit-icon">📱</div>
              <h4>Notifications</h4>
              <p>Get instant SMS/email reminders for your upcoming appointments.</p>
            </article>

            <article className="benefit-item">
              <div className="benefit-icon">📊</div>
              <h4>Health History</h4>
              <p>Keep all your appointment records and medical history in one place.</p>
            </article>
          </div>
        </section>

        <section className="landing-cta">
          <h3>Ready to get started?</h3>
          <div className="cta-buttons">
            <Link to="/register" className="cta primary">👤 Register as Patient</Link>
            <Link to="/doctor-register" className="cta secondary">👨‍⚕️ Register as Doctor</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

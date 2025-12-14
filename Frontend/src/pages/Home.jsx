import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'

export default function Home() {
  return (
    <div className="page home">
      <div className="container hero">
        <div className="hero-left">
          <h2 className="hero-title">Find trusted doctors & book appointments online</h2>
          <p className="lead">Search by specialty, location or doctor — view availability and get instant confirmations.</p>
          <div className="card-grid">
            <FeatureCard
              title="Browse Doctors"
              description="Explore doctors by specialty, read profiles, and check real-time availability."
              href="/doctors"
              cta="Browse"
              icon="👩‍⚕️"
            />

            <FeatureCard
              title="Create Account"
              description="Create a secure patient account to manage bookings and view history."
              href="/register"
              cta="Sign up"
              icon="📝"
            />

            <FeatureCard
              title="Quick Search"
              description="Search doctors by name, specialty or location and filter results instantly."
              href="/doctors"
              cta="Search"
              icon="🔎"
            />
          </div>

        </div>

        <div className="hero-right">
        </div>
      </div>
    </div>
  )
}

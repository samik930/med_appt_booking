import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="container landing-header-inner">
        <Link to="/" className="landing-logo-link"><Logo /></Link>
        <nav className="landing-nav">
          <Link to="/doctor-login" className="nav-link doctor">👨‍⚕️ Doctor Login</Link>
          <Link to="/login" className="nav-link patient">👤 Patient Login</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

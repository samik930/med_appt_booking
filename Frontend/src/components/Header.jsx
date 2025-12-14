import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Header() {
  const token = localStorage.getItem('token')

  return (
    <header className="site-header topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <Link to="/" className="logo-link"><Logo /></Link>
          <p className="tag">Healthcare appointments — fast & secure</p>
        </div>

        <div className="top-search">
          <input aria-label="Search doctors or specialities" placeholder="Search doctors, specialties or locations" />
        </div>

        <div className="top-actions">
          <nav>
            <Link to="/doctors">Doctors</Link>
            <Link to="/appointments">My Appointments</Link>
            {token ? (
              <Link to="/dashboard" className="dashboard-link">Dashboard</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="cta">Register</Link>
              </>
            )}
          </nav>
          <ThemeToggle />
          <div className="avatar" title="Profile">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor"/></svg>
          </div>
        </div>
      </div>
    </header>
  )
}

import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function DoctorHeader() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    window.location.href = '/'
  }

  return (
    <header className="site-header topbar">
      <div className="container topbar-inner">
        <div className="brand">
          <Link to="/" className="logo-link"><Logo /></Link>
          <p className="tag">Healthcare appointments — fast & secure</p>
        </div>

        <div className="top-actions">
          <ThemeToggle />
          <button onClick={handleLogout} className="secondary">Logout</button>
          <div className="avatar" title="Profile">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6v1H4v-1z" fill="currentColor"/></svg>
          </div>
        </div>
      </div>
    </header>
  )
}

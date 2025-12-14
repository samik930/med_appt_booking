import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="container auth-header-inner">
        <div className="auth-brand">
          <Link to="/" className="auth-logo-link"><Logo /></Link>
          <p className="auth-tag">Healthcare appointments — fast & secure</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

import { Link } from 'react-router-dom'

export default function FeatureCard({ title, description, href, cta = 'Explore', icon }) {
  return (
    <article className="feature-card">
      <div className="feature-top">
        <div className="feature-icon">{icon ?? '🩺'}</div>
        <h3>{title}</h3>
      </div>
      <p className="feature-desc">{description}</p>
      <div className="feature-actions">
        <Link to={href} className="primary small">{cta}</Link>
      </div>
    </article>
  )
}

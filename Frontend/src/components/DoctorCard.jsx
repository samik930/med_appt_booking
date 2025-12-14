import { Link } from 'react-router-dom'

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <div className="doctor-top">
        <div className="avatar-pill">{doctor.name.split(' ').slice(1,2)[0] ? doctor.name.split(' ')[1][0] : 'D'}</div>
        <div className="doctor-meta">
          <h3>{doctor.name}</h3>
          <div className="muted small">{doctor.specialty} • {doctor.location}</div>
        </div>
        <div className="doctor-rating">{doctor.rating ?? '—'}</div>
      </div>

      <p className="doctor-bio">{doctor.bio ?? 'Experienced practitioner.'}</p>

      <div className="doctor-actions">
        <Link to={`/doctors/${doctor.id}`} className="link">View profile</Link>
        <Link to={`/book/${doctor.id}`} className="primary small">Book</Link>
      </div>
    </article>
  )
}

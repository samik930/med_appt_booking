import { useParams, Link } from 'react-router-dom'

export default function DoctorProfile() {
  const { id } = useParams()

  // Placeholder data; replace with API call
  const doctor = { id, name: 'Dr. Alice Smith', specialty: 'Cardiology', bio: 'Experienced cardiologist.' }

  return (
    <div className="page doctor-profile container">
      <h2>{doctor.name}</h2>
      <p><strong>Specialty:</strong> {doctor.specialty}</p>
      <p>{doctor.bio}</p>
      <Link to={`/book/${doctor.id}`}>Book appointment</Link>
    </div>
  )
}

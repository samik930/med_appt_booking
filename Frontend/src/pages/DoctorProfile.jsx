import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function DoctorProfile() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDoctorDetails()
    fetchAvailability()
  }, [id])

  const fetchDoctorDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (response.ok) setDoctor(await response.json())
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/doctor/${id}/availability`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (response.ok) setAvailability(await response.json())
    } catch (error) { console.error('Error:', error) }
  }

  const bookAppointment = async () => {
    if (!selectedSlot) return alert('Please select a time slot')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: id, date: selectedSlot.date, time: selectedSlot.time })
      })
      if (response.ok) {
        alert('Appointment booked successfully!')
        navigate('/patient-dashboard')
      }
    } catch (error) { console.error('Error:', error) }
  }

  if (loading) return <div className="page container">Loading...</div>

  return (
    <div className="page doctor-profile container">
      <button onClick={() => navigate(-1)} className="secondary">← Back</button>
      
      <div className="doctor-header">
        <div className="avatar-pill large">{doctor?.name.split(' ').map(n => n[0]).join('')}</div>
        <div className="doctor-info">
          <h2>{doctor?.name}</h2>
          <p className="specialization">{doctor?.specialization}</p>
          <p className="experience">{doctor?.experience} years experience</p>
          <p className="bio">{doctor?.bio || 'Experienced practitioner.'}</p>
        </div>
      </div>

      <div className="availability-section">
        <h3>Available Time Slots</h3>
        <div className="slots-grid">
          {availability.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`slot-card ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
            >
              <p>{new Date(slot.date).toLocaleDateString()}</p>
              <p>{slot.time}</p>
            </button>
          ))}
        </div>
        
        {selectedSlot && (
          <button onClick={bookAppointment} className="primary">
            Book Appointment
          </button>
        )}
      </div>
    </div>

  )
}
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Booking() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [slot, setSlot] = useState('')

  const slots = ['2025-12-12 09:00', '2025-12-12 10:00', '2025-12-12 11:00']

  const handleBook = () => {
    // TODO: POST to backend to create appointment
    alert(`Booked ${slot} with doctor ${doctorId} (placeholder)`)
    navigate('/appointments')
  }

  return (
    <div className="page booking container">
      <h2>Book Appointment</h2>
      <p>Doctor ID: {doctorId}</p>
      <div className="slots">
        {slots.map((s) => (
          <label key={s}>
            <input type="radio" name="slot" value={s} onChange={() => setSlot(s)} /> {s}
          </label>
        ))}
      </div>
      <button onClick={handleBook} disabled={!slot}>Confirm Booking</button>
    </div>
  )
}

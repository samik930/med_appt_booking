import { useEffect, useState } from 'react'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    // TODO: load from backend
    setAppointments([])
  }, [])

  return (
    <div className="page appointments container">
      <h2>My Appointments</h2>
      <ul>
        {appointments.map((a) => (
          <li key={a.id}>{a.time} with {a.doctor} — {a.status}</li>
        ))}
      </ul>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
    fetchAppointments()
  }, [navigate])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/appointments/patient', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextAppointment = () => {
    if (appointments.length === 0) return null
    
    const now = new Date()
    const futureAppointments = appointments.filter(apt => {
      const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      return appointmentDateTime > now
    })
    
    return futureAppointments.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      return dateA - dateB
    })[0]
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  if (loading) {
    return <div className="page container">Loading...</div>
  }

  return (
    <div className="page dashboard container">
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="secondary">Logout</button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>My Appointments</h3>
          {appointments.length === 0 ? (
            <p>You have no appointments scheduled.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <h4>Dr. {appointment.doctor_name}</h4>
                  <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.appointment_time}</p>
                  <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button onClick={() => navigate('/doctors')} className="primary">
            Book New Appointment
          </button>
          <button onClick={() => navigate('/appointments')} className="secondary">
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  )
}

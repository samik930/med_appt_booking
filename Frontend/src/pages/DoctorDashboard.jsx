import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DoctorDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      navigate('/doctor-login')
      return
    }

    setUser(JSON.parse(userData))
    fetchAppointments()
  }, [navigate])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/appointments/doctor', {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    navigate('/')
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchAppointments() // Refresh appointments list
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  if (loading) {
    return <div className="page container">Loading...</div>
  }

  return (
    <div className="page dashboard container">
      <div className="dashboard-header">
        <h2>Doctor Dashboard</h2>
        <div className="user-info">
          <span>Dr. {user?.name}</span>
          <span className="specialization">{user?.specialization}</span>
          <button onClick={handleLogout} className="secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Today's Appointments</h3>
          {appointments.length === 0 ? (
            <p>No appointments scheduled for today.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <h4>{appointment.patient_name}</h4>
                  <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.appointment_time}</p>
                  <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>

                  {appointment.status === 'pending' && (
                    <div className="appointment-actions">
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="success"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="danger"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Total Appointments</h4>
            <p>{appointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Pending</h4>
            <p>{appointments.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="stat-card">
            <h4>Confirmed</h4>
            <p>{appointments.filter(a => a.status === 'confirmed').length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

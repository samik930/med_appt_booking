import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DoctorDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [patients, setPatients] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [newSlot, setNewSlot] = useState({ date: '', time: '' })
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
    fetchAvailability()
    fetchPatients()
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

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/doctor/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailabilitySlots(data)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
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

  const getTodayAppointments = () => {
    const today = new Date().toDateString()
    return appointments.filter(apt =>
      new Date(apt.appointment_date).toDateString() === today
    )
  }

  const getPendingAppointments = () => {
    return appointments.filter(apt => apt.status === 'pending')
  }

  const getConfirmedAppointments = () => {
    return appointments.filter(apt => apt.status === 'confirmed')
  }

  const addAvailabilitySlot = async () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Please select both date and time')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/doctor/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSlot)
      })

      if (response.ok) {
        fetchAvailability()
        setNewSlot({ date: '', time: '' })
      }
    } catch (error) {
      console.error('Error adding availability slot:', error)
    }
  }

  const removeAvailabilitySlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/doctor/availability/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchAvailability()
      }
    } catch (error) {
      console.error('Error removing availability slot:', error)
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
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'availability' ? 'active' : ''}
          onClick={() => setActiveTab('availability')}
        >
          Manage Availability
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Appointment Requests
        </button>
        <button
          className={activeTab === 'approved' ? 'active' : ''}
          onClick={() => setActiveTab('approved')}
        >
          Approved Appointments
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Patient History
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="dashboard-section">
            <h3>Welcome, Dr. {user?.name}</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Today's Appointments</h4>
                <p>{getTodayAppointments().length}</p>
              </div>
              <div className="stat-card">
                <h4>Pending Requests</h4>
                <p>{getPendingAppointments().length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="dashboard-section">
            <h3>Manage Availability</h3>
            <div className="add-slot-form">
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              />
              <input
                type="time"
                value={newSlot.time}
                onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
              />
              <button onClick={addAvailabilitySlot}>Add Slot</button>
            </div>
            <div className="availability-slots">
              {availabilitySlots.map(slot => (
                <div key={slot.id} className="slot-item">
                  <span>{new Date(slot.date).toLocaleDateString()} at {slot.time}</span>
                  <button onClick={() => removeAvailabilitySlot(slot.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="dashboard-section">
            <h3>Appointment Requests</h3>
            {getPendingAppointments().length === 0 ? (
              <p>No pending appointment requests.</p>
            ) : (
              <div className="appointments-list">
                {getPendingAppointments().map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <h4>{appointment.patient_name}</h4>
                    <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p>Time: {appointment.appointment_time}</p>
                    <div className="appointment-actions">
                      <button
                        className="success"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      >
                        Approve
                      </button>
                      <button
                        className="danger"
                        onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="dashboard-section">
            <h3>Approved Appointments</h3>
            {getConfirmedAppointments().length === 0 ? (
              <p>No approved appointments.</p>
            ) : (
              <div className="appointments-list">
                {getConfirmedAppointments().map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <h4>{appointment.patient_name}</h4>
                    <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p>Time: {appointment.appointment_time}</p>
                    <p>Status: <span className="status confirmed">Confirmed</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="dashboard-section">
            <h3>Patient History</h3>
            {patients.length === 0 ? (
              <p>No patient history available.</p>
            ) : (
              <div className="patients-list">
                {patients.map(patient => (
                  <div key={patient.id} className="patient-card">
                    <h4>{patient.name}</h4>
                    <p>Email: {patient.email}</p>
                    <p>Past Appointments: {patient.appointment_count || 0}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
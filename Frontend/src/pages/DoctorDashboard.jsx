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
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('Fetching appointments for doctor ID:', userData.id)
      console.log('Token exists:', !!token)
      
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/doctor?doctor_id=${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Appointments data received:', data)
        console.log('Appointments array:', data.appointments || data)
        console.log('Data type:', typeof data)
        console.log('Is array?', Array.isArray(data.appointments || data))
        setAppointments(data.appointments || data)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
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
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('Fetching availability with doctor ID:', userData.id)

      const response = await fetch('http://127.0.0.1:5000/api/doctor/availability', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-ID': userData.id,
          'Content-Type': 'application/json'
        }
      })

      console.log('Fetch availability response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Availability data received:', data)
        setAvailabilitySlots(data)
      } else {
        const errorText = await response.text()
        console.error('Fetch availability error:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:5000/api/doctor/patients', {
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
      console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`)
      
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      console.log('Status update response:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Status update successful:', result)
        fetchAppointments() // Refresh appointments list
        alert(`Appointment ${newStatus} successfully!`)
      } else {
        // Try to get error response, but handle cases where it's not JSON
        let errorMessage = 'Unknown error'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData)
        } catch (e) {
          errorMessage = await response.text() || `HTTP ${response.status} error`
        }
        console.error('Status update failed:', errorMessage)
        alert(`Failed to update appointment: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment. Please try again.')
    }
  }

  const getTodayAppointments = () => {
    const today = new Date().toDateString()
    return appointments.filter(apt =>
      new Date(apt.appointment_date).toDateString() === today
    )
  }

  const getPendingAppointments = () => {
    console.log('Raw appointments state:', appointments)
    console.log('Appointments length:', appointments.length)
    
    if (appointments.length === 0) {
      console.log('No appointments found in state')
      return []
    }
    
    const pending = appointments.filter(apt => {
      console.log('Checking appointment:', apt)
      console.log('Appointment status:', apt.status)
      console.log('Status equals scheduled?', apt.status === 'scheduled')
      console.log('Status equals pending?', apt.status === 'pending')
      console.log('Status equals confirmed?', apt.status === 'confirmed')
      // Filter for both 'scheduled' and 'pending' to catch all appointment requests
      return apt.status === 'scheduled' || apt.status === 'pending'
    })
    
    console.log('Filtered pending appointments:', pending)
    return pending
  }

  const getConfirmedAppointments = () => {
    console.log('Getting confirmed appointments from:', appointments)
    const confirmed = appointments.filter(apt => {
      console.log('Checking appointment for confirmed:', apt.id, apt.status)
      return apt.status === 'confirmed'
    })
    console.log('Confirmed appointments:', confirmed)
    return confirmed
  }

  const addAvailabilitySlot = async () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Please select both date and time')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const slotData = { ...newSlot, doctor_id: userData.id }
      console.log('Sending data:', slotData)

      const response = await fetch('http://127.0.0.1:5000/api/doctor/availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-ID': userData.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slotData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        fetchAvailability()
        setNewSlot({ date: '', time: '' })
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        alert(`Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error adding availability slot:', error)
    }
  }

  const removeAvailabilitySlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`http://127.0.0.1:5000/api/doctor/availability/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-ID': userData.id,
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
            {(() => {
              console.log('=== RENDERING APPOINTMENT REQUESTS ===')
              console.log('Active tab is requests:', activeTab === 'requests')
              console.log('Current appointments state:', appointments)
              
              const pendingApps = getPendingAppointments()
              console.log('Rendering pending appointments count:', pendingApps.length)
              console.log('Pending appointments details:', pendingApps)
              
              if (pendingApps.length === 0) {
                console.log('Rendering: No pending appointments message')
                return <p>No pending appointment requests.</p>
              } else {
                console.log('Rendering: Appointment list with', pendingApps.length, 'items')
                return (
                  <div className="appointments-list">
                    {pendingApps.map(appointment => {
                      console.log('Rendering appointment card:', appointment)
                      return (
                        <div key={appointment.id} className="appointment-card">
                          <h4>{appointment.patient?.name || 'Patient'}</h4>
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
                      )
                    })}
                  </div>
                )
              }
            })()}
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
                    <h4>{appointment.patient?.name || 'Patient'}</h4>
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

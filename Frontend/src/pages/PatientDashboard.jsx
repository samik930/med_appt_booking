import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
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
    fetchDoctors()
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

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching doctors with token:', token ? 'exists' : 'missing')
      
      const response = await fetch('http://127.0.0.1:5000/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Raw data from API:', data)
        console.log('Data type:', typeof data)
        console.log('Data length:', Array.isArray(data) ? data.length : 'not array')
        setDoctors(data)
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
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

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => {
      const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      return appointmentDateTime > now
    })
  }

  const getPastAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => {
      const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      return appointmentDateTime <= now
    })
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      })
      
      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  // Use client-side filtering since we have all doctors data
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization
    
    // Debug each doctor's filtering
    if (selectedSpecialization) {
      console.log(`Doctor: ${doctor.name}, Specialization: "${doctor.specialization}" vs Selected: "${selectedSpecialization}"`)
      console.log(`Matches specialization: ${matchesSpecialization}`)
    }
    
    return matchesSearch && matchesSpecialization
  })

  
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
          className={activeTab === 'book' ? 'active' : ''}
          onClick={() => setActiveTab('book')}
        >
          Book Appointment
        </button>
        <button
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => setActiveTab('appointments')}
        >
          My Appointments
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="dashboard-section">
            <h3>👋 Welcome, {user?.name}!</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h4>📅 Next Appointment</h4>
                {getNextAppointment() ? (
                  <div>
                    <p>Dr. {getNextAppointment().doctor_name}</p>
                    <p>{new Date(getNextAppointment().appointment_date).toLocaleDateString()}</p>
                    <p>{getNextAppointment().appointment_time}</p>
                  </div>
                ) : (
                  <p>No upcoming appointments</p>
                )}
              </div>
              
              <div className="stat-card">
                <h4>🔔 Appointment Status</h4>
                <p>Pending: {appointments.filter(a => a.status === 'pending').length}</p>
                <p>Confirmed: {appointments.filter(a => a.status === 'confirmed').length}</p>
                <p>Cancelled: {appointments.filter(a => a.status === 'cancelled').length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <div className="dashboard-section">
            <h3>📅 Book Appointment</h3>
            
            <div className="search-filters">
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
              </select>
              
                          </div>

            {filteredDoctors.length > 0 ? (
              <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="doctor-top">
                      <div className="avatar-pill">{doctor.name.split(' ').map(n => n[0]).join('')}</div>
                      <div className="doctor-meta">
                        <h4>{doctor.name}</h4>
                        <div className="muted small">{doctor.specialization}</div>
                        <div className="muted small">{doctor.experience_years} years experience</div>
                      </div>
                    </div>
                    
                    <div className="doctor-actions">
                      <button 
                        onClick={() => navigate(`/doctor-profile/${doctor.id}`)}
                        className="primary small"
                      >
                        View Available Slots
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-doctors-found">
                <p>No doctors found for the selected criteria.</p>
                {selectedSpecialization && (
                  <p>Try selecting a different specialization or search term.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="dashboard-section">
            <h3>📋 My Appointments</h3>
            
            <div className="appointment-tabs">
              <button
                className={activeTab === 'appointments-upcoming' ? 'active' : ''}
                onClick={() => setActiveTab('appointments-upcoming')}
              >
                📌 Upcoming ({getUpcomingAppointments().length})
              </button>
              <button
                className={activeTab === 'appointments-past' ? 'active' : ''}
                onClick={() => setActiveTab('appointments-past')}
              >
                🕒 Past ({getPastAppointments().length})
              </button>
            </div>

            {(activeTab === 'appointments-upcoming' || activeTab === 'appointments') && (
              <div className="appointments-list">
                {getUpcomingAppointments().length === 0 ? (
                  <p>No upcoming appointments.</p>
                ) : (
                  getUpcomingAppointments().map(appointment => (
                    <div key={appointment.id} className="appointment-card">
                      <h4>Dr. {appointment.doctor_name}</h4>
                      <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {appointment.appointment_time}</p>
                      <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
                      
                      <div className="appointment-actions">
                        {appointment.status !== 'cancelled' && (
                          <>
                            <button 
                              onClick={() => cancelAppointment(appointment.id)}
                              className="danger small"
                            >
                              ❌ Cancel
                            </button>
                            <button 
                              onClick={() => navigate(`/reschedule/${appointment.id}`)}
                              className="secondary small"
                            >
                              🔁 Reschedule
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'appointments-past' && (
              <div className="appointments-list">
                {getPastAppointments().length === 0 ? (
                  <p>No past appointments.</p>
                ) : (
                  getPastAppointments().map(appointment => (
                    <div key={appointment.id} className="appointment-card past">
                      <h4>Dr. {appointment.doctor_name}</h4>
                      <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {appointment.appointment_time}</p>
                      <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

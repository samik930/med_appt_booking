import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [activeTab, setActiveTab] = useState('overview')          // MAIN TABS
  const [appointmentTab, setAppointmentTab] = useState('upcoming') // SUB TABS
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  /* =========================
     AUTH + INITIAL LOAD
  ========================== */
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

  /* =========================
     AUTO REFRESH APPOINTMENTS
  ========================== */
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchAppointments()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  /* =========================
     API CALLS
  ========================== */
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = JSON.parse(localStorage.getItem('user'))

      const res = await fetch('http://127.0.0.1:5000/api/patients/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Patient-ID': userData.id,
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://127.0.0.1:5000/api/doctors', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        setDoctors(await res.json())
      }
    } catch (err) {
      console.error(err)
    }
  }

  /* =========================
     APPOINTMENT HELPERS
  ========================== */
  const now = new Date()

  const getUpcomingAppointments = () =>
    appointments.filter(a => new Date(`${a.appointment_date}T${a.appointment_time}`) > now)

  const getPastAppointments = () =>
    appointments.filter(a => new Date(`${a.appointment_date}T${a.appointment_time}`) <= now)

  const getNextAppointment = () =>
    getUpcomingAppointments().sort(
      (a, b) =>
        new Date(`${a.appointment_date}T${a.appointment_time}`) -
        new Date(`${b.appointment_date}T${b.appointment_time}`)
    )[0]

  /* =========================
     DOCTOR FILTER
  ========================== */
  const filteredDoctors = doctors.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchSpec = !selectedSpecialization || d.specialization === selectedSpecialization
    return matchSearch && matchSpec
  })

  if (loading) return <div className="page container">Loading...</div>

  /* =========================
     UI
  ========================== */
  return (
    <div className="page dashboard container">
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <span>Welcome, {user?.name}</span>
      </div>

      {/* MAIN TABS */}
      <div className="dashboard-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={activeTab === 'book' ? 'active' : ''} onClick={() => setActiveTab('book')}>
          Book Appointment
        </button>
        <button
          className={activeTab === 'appointments' ? 'active' : ''}
          onClick={() => {
            setActiveTab('appointments')
            setAppointmentTab('upcoming')
          }}
        >
          My Appointments
        </button>
      </div>

      <div className="dashboard-content">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="dashboard-section">
            <h3>📅 Next Appointment</h3>
            {getNextAppointment() ? (
              <>
                <p>Dr. {getNextAppointment().doctor?.name}</p>
                <p>{getNextAppointment().appointment_date}</p>
                <p>{getNextAppointment().appointment_time}</p>
              </>
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        )}

        {/* BOOK */}
        {activeTab === 'book' && (
          <div className="dashboard-section">
            <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <select value={selectedSpecialization} onChange={e => setSelectedSpecialization(e.target.value)}>
              <option value="">All Specializations</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Practice">General Practice</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Oncology">Oncology</option>
            </select>

            <div className="doctors-grid">
              {filteredDoctors.map(d => (
                <div key={d.id} className="doctor-card">
                  <h4>{d.name}</h4>
                  <p>{d.specialization}</p>
                  <button onClick={() => navigate(`/doctor-profile/${d.id}`)}>View Slots</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="dashboard-section">
            <h3>📋 My Appointments</h3>

            <div className="appointment-tabs">
              <button className={appointmentTab === 'upcoming' ? 'active' : ''} onClick={() => setAppointmentTab('upcoming')}>
                Upcoming ({getUpcomingAppointments().length})
              </button>
              <button className={appointmentTab === 'past' ? 'active' : ''} onClick={() => setAppointmentTab('past')}>
                Past ({getPastAppointments().length})
              </button>
            </div>

            {(appointmentTab === 'upcoming' ? getUpcomingAppointments() : getPastAppointments()).map(a => (
              <div key={a.id} className="appointment-card">
                <h4>Dr. {a.doctor?.name}</h4>
                <p>{a.appointment_date} — {a.appointment_time}</p>
                <p>Status: {a.status}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

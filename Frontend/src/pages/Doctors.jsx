import { useEffect, useState } from 'react'
import DoctorCard from '../components/DoctorCard'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')

  useEffect(() => {
    // TODO: fetch from backend
    setDoctors([])
  }, [])

  const filtered = doctors.filter((d) => {
    const q = query.toLowerCase()
    return (
      (!specialty || d.specialty === specialty) &&
      (!q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.location.toLowerCase().includes(q))
    )
  })

  return (
    <div className="page doctors">
      <div className="container doctors-layout">
        <aside className="filters">
          <h3>Filters</h3>
          <label>Search
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctors, specialties, clinics" />
          </label>
          <label>Specialty
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">All</option>
              <option>Cardiology</option>
              <option>Dermatology</option>
              <option>Pediatrics</option>
            </select>
          </label>
          <div style={{ marginTop: 12 }}>
            <button className="primary small" onClick={() => { setQuery(''); setSpecialty('') }}>Clear</button>
          </div>
        </aside>

        <section className="doctors-list">
          <div className="list-header">
            <h2>Available Doctors</h2>
            <div className="list-meta">{filtered.length} results</div>
          </div>
          <div className="doctors-grid">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

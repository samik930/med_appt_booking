import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import LandingHeader from './components/LandingHeader'
import AuthHeader from './components/AuthHeader'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorLogin from './pages/DoctorLogin'
import DoctorRegister from './pages/DoctorRegister'
import Doctors from './pages/Doctors'
import DoctorProfile from './pages/DoctorProfile'
import Booking from './pages/Booking'
import Appointments from './pages/Appointments'
import Dashboard from './pages/Dashboard'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuthPage = ['/login', '/register', '/doctor-login', '/doctor-register'].includes(location.pathname)

  return (
    <div className="app-root">
      {isLanding ? <LandingHeader /> : isAuthPage ? <AuthHeader /> : <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/doctor-register" element={<DoctorRegister />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/book/:doctorId" element={<Booking />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Routes>
      </main>
      {!isLanding && <Footer />}
    </div>
  )
}

export default App

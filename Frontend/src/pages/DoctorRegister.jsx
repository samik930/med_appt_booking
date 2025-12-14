import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function DoctorRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    phone: '',
    experienceYears: '',
    education: '',
    consultationFee: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }
    
    if (!formData.experienceYears) {
      newErrors.experienceYears = 'Experience years is required'
    } else if (isNaN(formData.experienceYears) || formData.experienceYears < 0) {
      newErrors.experienceYears = 'Experience years must be a positive number'
    }
    
    if (!formData.education.trim()) {
      newErrors.education = 'Education is required'
    }
    
    if (!formData.consultationFee) {
      newErrors.consultationFee = 'Consultation fee is required'
    } else if (isNaN(formData.consultationFee) || formData.consultationFee < 0) {
      newErrors.consultationFee = 'Consultation fee must be a positive number'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await authAPI.doctorRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization,
        phone: formData.phone,
        experienceYears: formData.experienceYears,
        education: formData.education,
        consultationFee: formData.consultationFee
      })
      
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.doctor))
      
      navigate('/doctor-dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error })
      } else {
        setErrors({ general: 'Registration failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <div className="auth-box">
          <h2>Register as Doctor</h2>
          {errors.general && <div className="error-message general">{errors.general}</div>}
          <form onSubmit={handleSubmit}>
            <label>
              Full Name
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name" 
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </label>
            <label>
              Email
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email" 
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </label>
            <label>
              Specialization
              <select 
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={errors.specialization ? 'error' : ''}
              >
                <option value="">Select specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Practice">General Practice</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Oncology">Oncology</option>
              </select>
              {errors.specialization && <span className="error-message">{errors.specialization}</span>}
            </label>
            <label>
              Phone Number
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="(555) 123-4567" 
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </label>
            <label>
              Experience Years
              <input 
                type="number" 
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className={errors.experienceYears ? 'error' : ''}
                placeholder="Years of experience" 
                min="0"
              />
              {errors.experienceYears && <span className="error-message">{errors.experienceYears}</span>}
            </label>
            <label>
              Education
              <input 
                type="text" 
                name="education"
                value={formData.education}
                onChange={handleChange}
                className={errors.education ? 'error' : ''}
                placeholder="Medical degree and institution" 
              />
              {errors.education && <span className="error-message">{errors.education}</span>}
            </label>
            <label>
              Consultation Fee ($)
              <input 
                type="number" 
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className={errors.consultationFee ? 'error' : ''}
                placeholder="Consultation fee" 
                min="0"
                step="0.01"
              />
              {errors.consultationFee && <span className="error-message">{errors.consultationFee}</span>}
            </label>
            <label>
              Password
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a strong password" 
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </label>
            <label>
              Confirm Password
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password" 
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </label>
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p className="auth-link">Already have an account? <Link to="/doctor-login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

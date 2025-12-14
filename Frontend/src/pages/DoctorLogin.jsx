import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      const response = await authAPI.doctorLogin({
        email: formData.email,
        password: formData.password
      })
      
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.doctor))
      
      navigate('/doctor-dashboard')
    } catch (error) {
      console.error('Login error:', error)
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error })
      } else {
        setErrors({ general: 'Login failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <div className="auth-box">
          <h2>Doctor Login</h2>
          {errors.general && <div className="error-message general">{errors.general}</div>}
          <form onSubmit={handleSubmit}>
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
              Password
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password" 
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </label>
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-link">New doctor? <Link to="/doctor-register">Register here</Link></p>
        </div>
      </div>
    </div>
  )
}

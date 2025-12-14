import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if not on login/register pages
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/doctor-login', '/doctor-register'].includes(currentPath);
      
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  patientLogin: (credentials) => api.post('/auth/patient/login', credentials),
  patientRegister: (userData) => api.post('/auth/patient/register', userData),
  doctorLogin: (credentials) => api.post('/auth/doctor/login', credentials),
  doctorRegister: (userData) => api.post('/auth/doctor/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Doctor endpoints
export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctorProfile: (id, data) => api.put(`/doctors/profile`, data),
  getDoctorAppointments: () => api.get('/doctors/appointments'),
};

// Patient endpoints
export const patientAPI = {
  updatePatientProfile: (id, data) => api.put(`/patients/profile`, data),
  getPatientAppointments: () => api.get('/patients/appointments'),
};

// Appointment endpoints
export const appointmentAPI = {
  createAppointment: (appointmentData) => {
    // Map frontend field names to backend field names
    const backendData = {
      ...appointmentData,
      notes: appointmentData.reason || 'General consultation'
    };
    delete backendData.reason;
    delete backendData.status; // Backend sets default status
    return api.post('/appointments', backendData);
  },
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
};

export default api;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Initialize theme before React renders to avoid flash
;(function initTheme() {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored)
      return
    }
    // fallback to system preference
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark')
  } catch (e) {
    // ignore
  }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

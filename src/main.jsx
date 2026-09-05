import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ACTIVE_PALETTE } from './theme/palettes.js'

document.documentElement.dataset.palette = ACTIVE_PALETTE

// Global smooth scroll for every same-page anchor link
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]')
  if (!anchor) return
  const target = document.querySelector(anchor.getAttribute('href'))
  if (!target) return
  e.preventDefault()
  const offset = target.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top: offset, behavior: 'smooth' })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AboutBioacoustics } from './components/AboutBioacoustics.tsx'
import { AboutUs } from './components/AboutUs.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about-bioacoustics" element={<AboutBioacoustics />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Router>
  </StrictMode>,
)

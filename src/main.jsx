import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import CompanyGate from './CompanyGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:companySlug" element={<CompanyGate />} />
        <Route path="/" element={
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#565B60" }}>
            Visit your company's link to sign in.
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
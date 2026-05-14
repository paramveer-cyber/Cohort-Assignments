import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const savedTheme = (() => {
  try { return localStorage.getItem('pollnow-theme') || 'dark' } catch { return 'dark' }
})()
document.documentElement.classList.add(savedTheme)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

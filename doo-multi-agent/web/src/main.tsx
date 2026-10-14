import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/assess.css'
import './styles/components.css'
import './styles/dashboard.css'
import './styles/profile.css'
import './styles/class-stats.css'
import './styles/portrait.css'
import './styles/admin-users.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@styles/index.css'

// Get app info from environment variables
const appName = import.meta.env.VITE_APP_NAME || 'Weather App';
document.title = appName;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
